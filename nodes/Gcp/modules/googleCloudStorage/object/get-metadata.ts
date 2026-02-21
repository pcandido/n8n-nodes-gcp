import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken } from './common';

export const googleCloudStorageObjectGetMetadataOption: INodePropertyOptions = {
	name: 'Get Metadata',
	value: 'getMetadata',
	description: 'Get object metadata',
	action: 'Get object metadata',
};

const metadataBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_getMetadata_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['getMetadata'] } },
};

const metadataFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_getMetadata_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['getMetadata'] } },
};

export const googleCloudStorageObjectGetMetadataProperties: INodeProperties[] = [metadataBucketProperty, metadataFilePathProperty];

export async function executeGoogleCloudStorageObjectGetMetadata(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(metadataBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(metadataFilePathProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let metadata: IDataObject;
	try {
		metadata = (await context.helpers.httpRequest({
			method: 'GET',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to get metadata: ${String(error)}`, { itemIndex });
	}

	return { json: metadata };
}
