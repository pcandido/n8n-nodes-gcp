# n8n-nodes-gcp

`n8n-nodes-gcp` is an n8n community node with modular Google Cloud Platform resources.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [official installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for n8n community nodes.

## Credentials

This node uses the credential type `GCP Service Account API` with:

- `Client Email`
- `Private Key` (PEM)

Recommended setup:

1. Create a Google Cloud Service Account.
2. Grant permissions for the resources/operations you want to use.
3. Add the service account credentials in n8n.

## Modules and Resource Documentation

Use this section as the canonical index of supported resources.
When a new module or resource is added, include it in this table and add a dedicated `README.md` in the resource folder.

| Module | Resource | Status | Documentation |
| --- | --- | --- | --- |
| Google Cloud Storage | Bucket | Available | [`nodes/Gcp/resources/googleCloudStorageBucket/README.md`](nodes/Gcp/resources/googleCloudStorageBucket/README.md) |
| Google Cloud Storage | Object | Available | [`nodes/Gcp/resources/googleCloudStorageObject/README.md`](nodes/Gcp/resources/googleCloudStorageObject/README.md) |


## Compatibility

- Node package version: `0.2.0`
- n8n Nodes API version: `1`

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Google Cloud Storage documentation](https://cloud.google.com/storage/docs)
- [Service account overview](https://cloud.google.com/iam/docs/service-account-overview)
