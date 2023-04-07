import { UrlCreateRequest } from '../../../backend/lib/data/urls/index';

interface CreateUrlFormRequest extends UrlCreateRequest {
  method: 'create'
}

interface DeleteUrlFormRequest {
  method: 'delete'
  id: string
}
