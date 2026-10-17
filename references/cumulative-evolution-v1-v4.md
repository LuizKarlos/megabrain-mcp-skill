# MegaBrain Cumulative Evolution: v1 through v4

This document records the exact architectural improvements and invariants designed, implemented, and verified across development cycles `dev_mcp_v1` through `dev_mcp_v4` on the MegaBrain platform.

---

## 1. Cycle dev_mcp_v1: Immutable Review Identity & Scope Contract

### Problem
Prior review loops evaluated arbitrary workspace states or historical commits, allowing reviewers to issue `PASS` without verifying that the exact delta promoted was the one reviewed. Furthermore, prompt refinement frequently inflated narrow allowlists into `paths: ["*"]`.

### Solution & Verified Implementation
1. **Delta Identity Contract (`IndependentReviewer.review`)**:
   - Compulsory validation of `base`, `head`, and `diff` in `implementation_result`.
   - Rejection if `base` or `head` diverges from `mission_contract`.
   - Cryptographic hashing of the diff:
     ```python
     "delta_identity": {
         "base": implementation_result.get("base") or mission_contract.get("base"),
         "head": implementation_result.get("head") or mission_contract.get("head"),
         "diff_sha256": hashlib.sha256((implementation_result.get("diff") or "").encode("utf-8")).hexdigest(),
         "files_manifest": sorted({str(f) for f in (implementation_result.get("files_changed") or []) + (implementation_result.get("files_created") or [])}),
     }
     ```
2. **Strict Mission ID Validation**:
   - Strict ASCII alphanumeric check plus `._-` characters, preventing path traversal outside `reports/`.
3. **Immutability Invariant**:
   - Rejection of conflicting delta identities under identical `mission_id` via fail-closed `ValueError`.

---

## 2. Cycle dev_mcp_v2: Crash-Atomic Publication & Idempotent Author Identity

### Problem
Directly writing review reports via `open(path, "w")` exposed partial JSON payloads to concurrent readers during sudden crash, OS interrupt, or race conditions. Additionally, idempotent re-runs returned fresh model IDs rather than preserving the winning reviewer model.

### Solution & Verified Implementation
1. **Crash-Atomic Write & Link Protocol**:
   - Create temporary file with restricted permissions in the destination directory:
     ```python
     reports_dir = Path(self.workspace_root) / "reports"
     reports_dir.mkdir(parents=True, exist_ok=True)
     report_path = reports_dir / f"review_{mission_id}.json"
     fd, temp_path = tempfile.mkstemp(dir=reports_dir)
     try:
         with os.fdopen(fd, "w", encoding="utf-8") as f:
             json.dump(review_result, f)
             f.flush()
             os.fsync(f.fileno())
         os.link(temp_path, report_path)
     except FileExistsError:
         existing = json.loads(report_path.read_text(encoding="utf-8"))
         if existing.get("delta_identity") != review_result["delta_identity"]:
             raise ValueError(f"Immutable review report conflict for mission {mission_id}")
         review_result = existing
     finally:
         os.unlink(temp_path)
     ```
2. **Idempotent Author Preservation**:
   - Method returns `(review_result, review_result["reviewer_model"])` so callers always receive the exact model identity that authored the winning persisted report.
3. **Guaranteed Temp Cleanup**:
   - `finally: os.unlink(temp_path)` guarantees zero residual temporary files regardless of exceptions or collisions.

---

## 3. Cycle dev_mcp_v3: Deterministic Concurrency Verification & Cleanup Oracles

### Problem
Thread-pool simulations without explicit sync points could race unevenly, failing to guarantee that concurrent link attempts actually collided on filesystem inodes. Tests of injected `os.link` failures did not assert clean directory state.

### Solution & Verified Implementation
1. **Deterministic Barrier Coordination**:
   - Utilized `threading.Barrier(2)` and wrapped `os.link` to guarantee two concurrent callers attempt link publication simultaneously:
     ```python
     real_link, b, attempts = os.link, Barrier(2), [0]
     def sync_link(*a, **kw):
         attempts[0] += 1
         b.wait()
         return real_link(*a, **kw)
     ```
2. **Observable Stable Oracles**:
   - `TEMP_CLEANUP_ORACLE`: asserts `review_M-F.json` does not exist after link failure and reports directory has no added entries.
   - `CONCURRENT_LINK_ORACLE`: asserts `attempts == 2`, `review_result == r2`, and both return the identical winning `reviewer_model`.

---

## 4. Cycle dev_mcp_v4: Directory-Level Durability (`fsync(reports_dir)`)

### Problem
Fsyncing the file descriptor (`os.fsync(f.fileno())`) flushes file content to disk, but POSIX filesystems do not guarantee the directory entry pointing to that inode is persisted until the directory descriptor itself is fsynced. On power failure or sudden OS reboot, the newly linked entry could disappear.

### Solution & Verified Implementation
1. **Directory Fsync Protocol**:
   - Immediately after `os.link(temp_path, report_path)` succeeds, open `reports_dir` in read-only mode, fsync its descriptor, and close it in `finally`:
     ```python
     os.link(temp_path, report_path)
     descritor = os.open(reports_dir, os.O_RDONLY)
     try:
         os.fsync(descritor)
     finally:
         os.close(descritor)
     ```
2. **Clean Error & Cleanup Isolation**:
   - `FileExistsError` handling remains untouched.
   - Descriptor closure is guaranteed in `finally: os.close(descritor)`.
   - `DIRECTORY_FSYNC_ORACLE`: asserts directory descriptor is opened and fsynced exactly once during successful publication.
