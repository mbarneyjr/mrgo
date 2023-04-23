import { UrlUpdateRequest } from '../../../../backend/lib/data/urls/index';

interface UpdateUrlFormRequest extends UrlUpdateRequest {}

export function parsePostUrlsBody(body: string): UpdateUrlFormRequest
