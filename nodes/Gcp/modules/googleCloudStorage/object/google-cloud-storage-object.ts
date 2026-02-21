import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import {
	executeGoogleCloudStorageObjectChangeVisibility,
	googleCloudStorageObjectChangeVisibilityOption,
	googleCloudStorageObjectChangeVisibilityProperties,
} from './change-visibility';
import {
	executeGoogleCloudStorageObjectCopy,
	googleCloudStorageObjectCopyOption,
	googleCloudStorageObjectCopyProperties,
} from './copy';
import {
	executeGoogleCloudStorageObjectDelete,
	googleCloudStorageObjectDeleteOption,
	googleCloudStorageObjectDeleteProperties,
} from './delete';
import {
	executeGoogleCloudStorageObjectDownload,
	googleCloudStorageObjectDownloadOption,
	googleCloudStorageObjectDownloadProperties,
} from './download';
import {
	executeGoogleCloudStorageObjectExists,
	googleCloudStorageObjectExistsOption,
	googleCloudStorageObjectExistsProperties,
} from './exists';
import {
	executeGoogleCloudStorageObjectGetMetadata,
	googleCloudStorageObjectGetMetadataOption,
	googleCloudStorageObjectGetMetadataProperties,
} from './get-metadata';
import {
	executeGoogleCloudStorageObjectList,
	googleCloudStorageObjectListOption,
	googleCloudStorageObjectListProperties,
} from './list';
import {
	executeGoogleCloudStorageObjectMove,
	googleCloudStorageObjectMoveOption,
	googleCloudStorageObjectMoveProperties,
} from './move';
import {
	executeGoogleCloudStorageObjectSetMetadata,
	googleCloudStorageObjectSetMetadataOption,
	googleCloudStorageObjectSetMetadataProperties,
} from './set-metadata';
import {
	executeGoogleCloudStorageObjectSignDownloadUrl,
	googleCloudStorageObjectSignDownloadUrlOption,
	googleCloudStorageObjectSignDownloadUrlProperties,
} from './sign-download-url';
import {
	executeGoogleCloudStorageObjectSignUploadUrl,
	googleCloudStorageObjectSignUploadUrlOption,
	googleCloudStorageObjectSignUploadUrlProperties,
} from './sign-upload-url';
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
	options: [
		googleCloudStorageObjectUploadOption,
		googleCloudStorageObjectDownloadOption,
		googleCloudStorageObjectDeleteOption,
		googleCloudStorageObjectExistsOption,
		googleCloudStorageObjectGetMetadataOption,
		googleCloudStorageObjectSetMetadataOption,
		googleCloudStorageObjectCopyOption,
		googleCloudStorageObjectMoveOption,
		googleCloudStorageObjectListOption,
		googleCloudStorageObjectSignDownloadUrlOption,
		googleCloudStorageObjectSignUploadUrlOption,
		googleCloudStorageObjectChangeVisibilityOption,
	],
};

export const googleCloudStorageObjectProperties: INodeProperties[] = [
	googleCloudStorageObjectOperationProperty,
	...googleCloudStorageObjectUploadProperties,
	...googleCloudStorageObjectDownloadProperties,
	...googleCloudStorageObjectDeleteProperties,
	...googleCloudStorageObjectExistsProperties,
	...googleCloudStorageObjectGetMetadataProperties,
	...googleCloudStorageObjectSetMetadataProperties,
	...googleCloudStorageObjectCopyProperties,
	...googleCloudStorageObjectMoveProperties,
	...googleCloudStorageObjectListProperties,
	...googleCloudStorageObjectSignDownloadUrlProperties,
	...googleCloudStorageObjectSignUploadUrlProperties,
	...googleCloudStorageObjectChangeVisibilityProperties,
];

export async function executeGoogleCloudStorageObject(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<IOperationResult> {
	const operation = context.getNodeParameter(googleCloudStorageObjectOperationProperty.name, itemIndex) as string;

	switch (operation) {
		case 'upload':
			return await executeGoogleCloudStorageObjectUpload(context, items, itemIndex);
		case 'download':
			return await executeGoogleCloudStorageObjectDownload(context, itemIndex);
		case 'delete':
			return await executeGoogleCloudStorageObjectDelete(context, itemIndex);
		case 'exists':
			return await executeGoogleCloudStorageObjectExists(context, itemIndex);
		case 'getMetadata':
			return await executeGoogleCloudStorageObjectGetMetadata(context, itemIndex);
		case 'setMetadata':
			return await executeGoogleCloudStorageObjectSetMetadata(context, itemIndex);
		case 'copy':
			return await executeGoogleCloudStorageObjectCopy(context, itemIndex);
		case 'move':
			return await executeGoogleCloudStorageObjectMove(context, itemIndex);
		case 'list':
			return await executeGoogleCloudStorageObjectList(context, itemIndex);
		case 'signDownloadUrl':
			return await executeGoogleCloudStorageObjectSignDownloadUrl(context, itemIndex);
		case 'signUploadUrl':
			return await executeGoogleCloudStorageObjectSignUploadUrl(context, itemIndex);
		case 'changeVisibility':
			return await executeGoogleCloudStorageObjectChangeVisibility(context, itemIndex);
		default:
			throw new NodeOperationError(
				context.getNode(),
				`Unsupported Google Cloud Storage Object operation: ${operation}`,
				{ itemIndex },
			);
	}
}
