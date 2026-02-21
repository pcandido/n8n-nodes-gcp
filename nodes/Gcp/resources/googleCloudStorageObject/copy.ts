import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken } from './common';

export const googleCloudStorageObjectCopyOption: INodePropertyOptions = {
	name: 'Copy',
	value: 'copy',
	description: 'Copy object to another location',
	action: 'Copy an object',
};

const copySourceBucketProperty: INodeProperties = {
	displayName: 'Source Bucket',
	name: 'googleCloudStorage_object_copy_sourceBucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['copy'] } },
};

const copySourceFilePathProperty: INodeProperties = {
	displayName: 'Source File Path',
	name: 'googleCloudStorage_object_copy_sourceFilePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['copy'] } },
};

const copyDestinationBucketProperty: INodeProperties = {
	displayName: 'Destination Bucket',
	name: 'googleCloudStorage_object_copy_destinationBucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['copy'] } },
};

const copyDestinationFilePathProperty: INodeProperties = {
	displayName: 'Destination File Path',
	name: 'googleCloudStorage_object_copy_destinationFilePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['copy'] } },
};

export const googleCloudStorageObjectCopyProperties: INodeProperties[] = [
	copySourceBucketProperty,
	copySourceFilePathProperty,
	copyDestinationBucketProperty,
	copyDestinationFilePathProperty,
];

export async function executeGoogleCloudStorageObjectCopy(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const sourceBucket = context.getNodeParameter(copySourceBucketProperty.name, itemIndex) as string;
	const sourceFilePath = context.getNodeParameter(copySourceFilePathProperty.name, itemIndex) as string;
	const destinationBucket = context.getNodeParameter(copyDestinationBucketProperty.name, itemIndex) as string;
	const destinationFilePath = context.getNodeParameter(copyDestinationFilePathProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let copiedObject: IDataObject;
	try {
		copiedObject = (await context.helpers.httpRequest({
			method: 'POST',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(sourceBucket)}/o/${encodeObjectName(sourceFilePath)}/copyTo/b/${encodeURIComponent(destinationBucket)}/o/${encodeObjectName(destinationFilePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to copy object: ${String(error)}`, { itemIndex });
	}

	return { json: copiedObject };
}
