import * as CreateUrlForm from './create-url-form.mjs';
import * as EditUrlForm from './edit-url-form.mjs';
import * as UrlList from './url-list.mjs';
import * as NavigationBar from './navigation-bar.mjs';

export default {
  [CreateUrlForm.ELEMENT_NAME]: CreateUrlForm.element,
  [EditUrlForm.ELEMENT_NAME]: EditUrlForm.element,
  [UrlList.ELEMENT_NAME]: UrlList.element,
  [NavigationBar.ELEMENT_NAME]: NavigationBar.element,
};
