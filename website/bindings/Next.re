module Link = {
  [@bs.module "next/link"] [@react.component]
  external make:
    (
      ~href: string=?,
      ~_as: string=?,
      ~replace: bool=?,
      ~shallow: bool=?,
      ~passHref: bool=?,
      ~children: React.element
    ) =>
    React.element =
    "default";
};

module Head = {
  [@bs.module "next/head"] [@react.component]
  external make: (~children: React.element) => React.element = "default";
};

module Error = {
  [@bs.module "next/error"] [@react.component]
  external make: (~statusCode: int) => React.element = "default";
};

module QueryString = {
  type t;
  [@bs.module "querystring"] external parse: string => t = "parse";
};

module Router = {
  [@gentype]
  type t = {
    .
    "route": string,
    "pathname": string,
    "query": QueryString.t,
    "asPath": string,
  };

  [@bs.module "next/router"] external useRouter: unit => t = "useRouter";

  [@bs.send] external push: (t, ~url: string) => Js.Promise.t(bool) = "push";
};