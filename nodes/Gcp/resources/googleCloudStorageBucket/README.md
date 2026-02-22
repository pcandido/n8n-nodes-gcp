# Google Cloud Storage - Bucket Resource

This document describes the `Google Cloud Storage - Bucket` resource available in the `GCP` node.

## Available Operations

- `Create Bucket`
- `Delete Bucket`
- `Get Bucket Metadata`
- `Set Bucket Metadata`
- `List Buckets`

## Operation Summary

| Operation | Description |
| --- | --- |
| `Create Bucket` | Creates a bucket in a Google Cloud project. |
| `Delete Bucket` | Deletes an existing bucket. |
| `Get Bucket Metadata` | Fetches metadata from a bucket. |
| `Set Bucket Metadata` | Applies metadata changes to a bucket using `PATCH`. |
| `List Buckets` | Lists buckets from a Google Cloud project. |

## Authentication

This resource uses the shared credential `GCP Service Account API` and requests the scope:

- `https://www.googleapis.com/auth/devstorage.read_write`

## Notes

- Bucket names must be globally unique in Google Cloud Storage.
- `Delete Bucket` fails if the bucket is not empty.
- `Set Bucket Metadata` expects a valid JSON object.
