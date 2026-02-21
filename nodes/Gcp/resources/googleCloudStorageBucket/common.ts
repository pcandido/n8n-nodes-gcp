import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getGoogleServiceAccountAccessToken } from '../../../shared/get-access-token';

const GCS_RW_SCOPE = 'https://www.googleapis.com/auth/devstorage.read_write';

export async function getGcsAccessToken(context: IExecuteFunctions, itemIndex: number): Promise<string> {
	return getGoogleServiceAccountAccessToken(context, itemIndex, GCS_RW_SCOPE);
}

export function ensureBucketMetadata(value: unknown, itemIndex: number, context: IExecuteFunctions): IDataObject {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new NodeOperationError(context.getNode(), 'Metadata must be a JSON object.', { itemIndex });
	}

	return value as IDataObject;
}
