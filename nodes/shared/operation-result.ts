import type { IBinaryKeyData, IDataObject } from 'n8n-workflow';

export interface IOperationResult {
	json: IDataObject;
	binary?: IBinaryKeyData;
}
