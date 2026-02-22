# Google Cloud Storage - Object Resource

This document describes the `Google Cloud Storage - Object` resource available in the `GCP` node.

## Available Operations

- `Upload`
- `Download`
- `Delete`
- `Exists`
- `Get Metadata`
- `Set Metadata`
- `Copy`
- `Move`
- `List`
- `Sign Download URL`
- `Sign Upload URL`
- `Change Visibility`

## Operation Summary

| Operation | Description |
| --- | --- |
| `Upload` | Uploads a binary input to a bucket path. |
| `Download` | Downloads an object and outputs binary data. |
| `Delete` | Deletes an object from a bucket. |
| `Exists` | Checks whether an object exists. |
| `Get Metadata` | Retrieves object metadata. |
| `Set Metadata` | Updates object metadata using `PATCH`. |
| `Copy` | Copies an object to a new bucket/path. |
| `Move` | Moves an object (copy + delete). |
| `List` | Lists objects in a bucket, optionally filtered by prefix. |
| `Sign Download URL` | Generates a signed URL for downloading an object. |
| `Sign Upload URL` | Generates a signed URL for uploading an object. |
| `Change Visibility` | Changes object ACL visibility between private/public. |

## Authentication

This resource uses the shared credential `GCP Service Account API`.

Scopes are operation-dependent:

- Most read/write operations use `https://www.googleapis.com/auth/devstorage.read_write`
- `Change Visibility` uses `https://www.googleapis.com/auth/devstorage.full_control`

## Notes

- `Upload` requires a valid binary property in the input item.
- `Download` writes to the configured output binary property.
- Signed URL operations generate V2 signed URLs.
- `Set Metadata` expects a valid JSON object.
