declare namespace HoneyJSX {
    interface HoneyElement {
        type: string | Function;
        props: { [prop: string]: any };
        children: HoneyElement[] | HoneyElement | string;
    }

    interface IntrinsicElements {
        // Common HTML Elements
        a: any;
        div: any;
        span: any;
        p: any;
        button: any;
        input: any;
        select: any;
        option: any;
        textarea: any;
        form: any;
        h1: any;
        h2: any;
        h3: any;
        h4: any;
        h5: any;
        h6: any;
        img: any;
        ul: any;
        ol: any;
        li: any;
        table: any;
        tr: any;
        td: any;
        th: any;
        thead: any;
        tbody: any;
        tfoot: any;
        label: any;
        fieldset: any;
        legend: any;
        section: any;
        header: any;
        footer: any;
        article: any;
        nav: any;
        aside: any;
        main: any;

        // SVG Elements
        svg: any;
        path: any;
        circle: any;
        rect: any;
        polyline: any;
        line: any;
        text: any;

        // Custom or less common elements can be added here
        [elemName: string]: any;
    }

    interface ElementAttributesProperty {
        props: {};
    }
}

declare module JSX {
    interface IntrinsicElements extends HoneyJSX.IntrinsicElements {}

    interface IntrinsicElements extends HoneyJSX.IntrinsicElements {}
    interface Element extends HoneyJSX.HoneyElement {}
    interface ElementClass {
        render(): HoneyJSX.HoneyElement;
    }
    interface ElementAttributesProperty
        extends HoneyJSX.ElementAttributesProperty {}
}
