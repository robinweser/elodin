module Prism = {
  [@bs.module "prismjs"]
  external highlight: (string, Js.t('a), string) => string = "highlight";

  [@bs.module "prismjs"]
  external getLanguage: string => Js.t('a) = "getLanguage";
};