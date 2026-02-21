import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { encodeObjectName, ensureObjectMetadata, getGcsAccessToken } from './common';

export const googleCloudStorageObjectSetMetadataOption: INodePropertyOptions = {
	name: 'Set Metadata',
	value: 'setMetadata',
	description: 'Patch object metadata',
	action: 'Set object metadata',
};

const setMetadataBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_setMetadata_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['setMetadata'] } },
};

const setMetadataFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_setMetadata_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['setMetadata'] } },
};

const setMetadataJsonProperty: INodeProperties = {
	displayName: 'Metadata JSON',
	name: 'googleCloudStorage_object_setMetadata_json',
	type: 'json',
	default: '{}',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['setMetadata'] } },
	description: 'JSON object used to patch metadata',
};

export const googleCloudStorageObjectSetMetadataProperties: INodeProperties[] = [
	setMetadataBucketProperty,
	setMetadataFilePathProperty,
	setMetadataJsonProperty,
];

export async function executeGoogleCloudStorageObjectSetMetadata(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(setMetadataBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(setMetadataFilePathProperty.name, itemIndex) as string;
	const metadataValue = context.getNodeParameter(setMetadataJsonProperty.name, itemIndex) as unknown;
	const metadata = ensureObjectMetadata(metadataValue, itemIndex, context);
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let response: IDataObject;
	try {
		response = (await context.helpers.httpRequest({
			method: 'PATCH',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			body: metadata,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to set metadata: ${String(error)}`, { itemIndex });
	}

	return { json: response };
}
