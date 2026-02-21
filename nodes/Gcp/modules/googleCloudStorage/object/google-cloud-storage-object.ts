import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	executeGoogleCloudStorageObjectUpload,
	googleCloudStorageObjectUploadOption,
	googleCloudStorageObjectUploadProperties,
} from './upload';

export const googleCloudStorageObjectEntityOption: INodePropertyOptions = {
	name: 'Object',
	value: 'object',
};

const googleCloudStorageObjectOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'googleCloudStorageObjectOperation',
	type: 'options',
	noDataExpression: true,
	default: 'upload',
	displayOptions: {
		show: {
			gcpModule: ['googleCloudStorage'],
			googleCloudStorageEntity: ['object'],
		},
	},
	options: [googleCloudStorageObjectUploadOption],
};

export const googleCloudStorageObjectProperties: INodeProperties[] = [
	googleCloudStorageObjectOperationProperty,
	...googleCloudStorageObjectUploadProperties,
];

export async function executeGoogleCloudStorageObject(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<Record<string, unknown>> {
	const operation = context.getNodeParameter(googleCloudStorageObjectOperationProperty.name, itemIndex) as string;

	switch (operation) {
		case 'upload': return executeGoogleCloudStorageObjectUpload(context, items, itemIndex);
		default:
			throw new NodeOperationError(
				context.getNode(),
				`Unsupported Google Cloud Storage Object operation: ${operation}`,
				{ itemIndex },
			);
	}
}
