import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken } from './common';

export const googleCloudStorageObjectMoveOption: INodePropertyOptions = {
	name: 'Move',
	value: 'move',
	description: 'Move object to another location',
	action: 'Move an object',
};

const moveSourceBucketProperty: INodeProperties = {
	displayName: 'Source Bucket',
	name: 'googleCloudStorage_object_move_sourceBucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['move'] } },
};

const moveSourceFilePathProperty: INodeProperties = {
	displayName: 'Source File Path',
	name: 'googleCloudStorage_object_move_sourceFilePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['move'] } },
};

const moveDestinationBucketProperty: INodeProperties = {
	displayName: 'Destination Bucket',
	name: 'googleCloudStorage_object_move_destinationBucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['move'] } },
};

const moveDestinationFilePathProperty: INodeProperties = {
	displayName: 'Destination File Path',
	name: 'googleCloudStorage_object_move_destinationFilePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['move'] } },
};

export const googleCloudStorageObjectMoveProperties: INodeProperties[] = [
	moveSourceBucketProperty,
	moveSourceFilePathProperty,
	moveDestinationBucketProperty,
	moveDestinationFilePathProperty,
];

export async function executeGoogleCloudStorageObjectMove(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const sourceBucket = context.getNodeParameter(moveSourceBucketProperty.name, itemIndex) as string;
	const sourceFilePath = context.getNodeParameter(moveSourceFilePathProperty.name, itemIndex) as string;
	const destinationBucket = context.getNodeParameter(moveDestinationBucketProperty.name, itemIndex) as string;
	const destinationFilePath = context.getNodeParameter(moveDestinationFilePathProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let movedObject: IDataObject;
	try {
		movedObject = (await context.helpers.httpRequest({
			method: 'POST',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(sourceBucket)}/o/${encodeObjectName(sourceFilePath)}/copyTo/b/${encodeURIComponent(destinationBucket)}/o/${encodeObjectName(destinationFilePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		})) as IDataObject;

		await context.helpers.httpRequest({
			method: 'DELETE',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(sourceBucket)}/o/${encodeObjectName(sourceFilePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		});
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to move object: ${String(error)}`, { itemIndex });
	}

	return { json: movedObject };
}
