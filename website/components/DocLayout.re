open Utils;
open Prism;
open Next;

let prism: Js.t('a) = [%bs.raw {| require("prismjs")|}];
[%bs.raw {|require('prismjs/components/prism-jsx.js') |}];
[%bs.raw {|require('prismjs/components/prism-javascript.js') |}];
[%bs.raw {|require('prismjs/components/prism-reason.js') |}];
[%bs.raw {|require('prismjs/components/prism-bash.js') |}];

let components = {
  "h1": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();

    <h1
      className={css([
        MarkdownStyle.titleText(),
        Fela.style({
          "& + p": {
            "marginTop": "20px",
          },
        }),
      ])}>
      {props##children}
    </h1>;
  },
  "h2": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <h2
      className={css([
        MarkdownStyle.heading(),
        MarkdownStyle.headingTwo(),
        MarkdownStyle.headingText(),
      ])}>
      {props##children}
    </h2>;
  },
  "h3": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <h3
      className={css([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h3>;
  },

  "h4": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <h4
      className={css([MarkdownStyle.fileName(), MarkdownStyle.headingText()])}>
      {props##children}
    </h4>;
  },

  "h5": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <h5
      className={css([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h5>;
  },

  "h6": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <h6
      className={css([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h6>;
  },

  "p": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <p
      className={css([
        MarkdownStyle.paragraph(),
        MarkdownStyle.paragraphText(),
      ])}>
      {props##children}
    </p>;
  },
  "code":
    (
      props: {
        .
        children: string,
        className: option(string),
      },
    ) => {
    let css = ReactFela.useFela();
    let css1 = ReactFela.useFela1();
    let className = resolveOption(props##className, c => c, "");
    let language = Js.String.substr(9, className);

    let languages: Js.Dict.t('a) = prism##languages;

    let languageData = Js.Dict.get(languages, language);

    let highlighted =
      switch (languageData) {
      | Some(data) => Prism.highlight(props##children, data, language)
      | None => props##children
      };

    <pre className={css1(MarkdownStyle.codeBox())}>
      <code
        className={css([MarkdownStyle.code(), Fela.raw(className)])}
        dangerouslySetInnerHTML={__html: highlighted}
      />
    </pre>;
  },
  "td": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <td className={css(MarkdownStyle.tableCell())}> {props##children} </td>;
  },
  "table": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <table className={css(MarkdownStyle.table())}> {props##children} </table>;
  },
  "th": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <th className={css(MarkdownStyle.tableHead())}> {props##children} </th>;
  },
  "tr": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <tr className={css(MarkdownStyle.tableRow())}> {props##children} </tr>;
  },
  "inlineCode": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <pre className={css(MarkdownStyle.inlineCodeBox())}>
      <code className={css(MarkdownStyle.code())}> {props##children} </code>
    </pre>;
  },
  "strong": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <b className={css(MarkdownStyle.strong())}> {props##children} </b>;
  },
  "a":
    (
      props: {
        .
        href: string,
        children: React.element,
      },
    ) => {
    let css = ReactFela.useFela1();

    <a
      href={
        props##href;
      }
      className={css(MarkdownStyle.link())}>
      {props##children}
    </a>;
  },
  "ul": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <ul className={css([MarkdownStyle.list(), MarkdownStyle.listText()])}>
      {props##children}
    </ul>;
  },
  "ol": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <ol className={css([MarkdownStyle.list(), MarkdownStyle.listText()])}>
      {props##children}
    </ol>;
  },
  "li": (props: {. children: React.element}) => {
    let css = ReactFela.useFela1();
    <li className={css(MarkdownStyle.listItem())}> {props##children} </li>;
  },

  "blockquote": (props: {. children: React.element}) => {
    let css = ReactFela.useFela();
    <div
      className={css([
        MarkdownStyle.blockquote(),
        MarkdownStyle.blockquoteText(),
      ])}>
      {props##children}
    </div>;
  },
};

[@react.component]
let make = (~children) => {
  let css = ReactFela.useFela();
  let css1 = ReactFela.useFela1();

  <Page>
    <Head>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism.min.css"
        rel="stylesheet"
      />
      <title> {"Elodin - Documentation" |> s} </title>
    </Head>
    <Section style={ReactDOMRe.Style.make(~flexShrink="1", ())}>
      <div
        style={ReactDOMRe.Style.make(
          ~position="absolute",
          ~paddingLeft="999px",
          ~marginLeft="-999px",
          ~height="100%",
          ~backgroundColor="rgb(245, 245, 245)",
          (),
        )}
      />
      <div className={css1(LayoutStyle.row())}>
        <Navigation />
        <MDX.MDXProvider components>
          <div
            className={css([
              LayoutStyle.docContent(),
              Fela.style({
                "::-webkit-scrollbar": {
                  "display": "none",
                },
              }),
            ])}>
            children
          </div>
        </MDX.MDXProvider>
      </div>
    </Section>
  </Page>;
};