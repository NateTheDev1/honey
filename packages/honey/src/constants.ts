export const HONEY_COMPONENT_ID = 'data-honey-component-id';

/**
 * Devtools
 */
export const HONEY_DEVTOOL_INIT_EVENT = 'HoneyAppData';
export const HONEY_SELECTOR_ACTIVE_EVENT = 'HoneySelectorActive';
export const HONEY_SELECTOR_RESULT_EVENT = 'HoneySelectorResult';
export const HONEY_SELECTOR_CLOSE_EVENT = 'HoneySelectorClose';

/**
 * Reporting
 */
export const importantMetaTags: Array<{
    name: string;
    content: string;
    attributeType: 'name' | 'property' | 'http-equiv';
    onMissing: {
        type: 'errors' | 'warnings';
        message: string;
    };
    onInvalid: {
        type: 'errors' | 'warnings';
        message: string;
    };
    validator?: (metaTag: HTMLMetaElement) => boolean;
}> = [
    {
        name: 'description',
        content: 'Description of the page content',
        attributeType: 'name',
        onMissing: {
            type: 'errors',
            message:
                'The description meta tag is missing. Add a description to the page to improve SEO.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The description meta tag is invalid. Add a valid description to the page to improve SEO.'
        },
        validator: metaTag => {
            return metaTag.content.length <= 160;
        }
    }, // SEO: Summarizes page content for search results.
    {
        name: 'keywords',
        content: 'keyword1, keyword2, keyword3',
        attributeType: 'name',
        onMissing: {
            type: 'warnings',
            message:
                'The keywords meta tag is missing. Although less important now, consider adding keywords to the page.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The keywords meta tag is invalid. Although less important now, consider adding valid keywords to the page.'
        },
        validator: metaTag => {
            return metaTag.content.split(',').length <= 10;
        }
    }, // SEO: Less important now, but used to indicate the page's keywords.
    {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
        attributeType: 'name',
        onMissing: {
            type: 'errors',
            message:
                'The viewport meta tag is missing. Add a viewport meta tag to improve mobile responsiveness.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The viewport meta tag is invalid. Add a valid viewport meta tag to improve mobile responsiveness.'
        },
        validator: metaTag => {
            return (
                metaTag.content.includes('width=device-width') &&
                metaTag.content.includes('initial-scale=1')
            );
        }
    }, // Responsive design: Controls viewport settings for mobile devices.
    {
        name: 'charset',
        content: 'UTF-8',
        attributeType: 'http-equiv',
        onMissing: {
            type: 'errors',
            message:
                'The charset meta tag is missing. Add a charset meta tag to specify the character encoding for the HTML document.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The charset meta tag is invalid. Add a valid charset meta tag to specify the character encoding for the HTML document.'
        },
        validator: metaTag => {
            return metaTag.content.toLowerCase() === 'utf-8';
        }
    }, // Document encoding: Specifies the character encoding for the HTML document.
    {
        name: 'robots',
        content: 'index, follow',
        attributeType: 'name',
        onMissing: {
            type: 'warnings',
            message:
                'The robots meta tag is missing. Add a robots meta tag to instruct search engines on crawling and indexing.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The robots meta tag is invalid. Add a valid robots meta tag to instruct search engines on crawling and indexing.'
        },
        validator: metaTag => {
            return (
                metaTag.content === 'index, follow' ||
                metaTag.content === 'noindex, nofollow'
            );
        }
    }, // SEO: Instructs search engines on crawling and indexing.
    {
        name: 'author',
        content: 'Author Name',
        attributeType: 'name',
        onMissing: {
            type: 'warnings',
            message:
                'The author meta tag is missing. Add an author meta tag to specify the name of the author of the document.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The author meta tag is invalid. Add a valid author meta tag to specify the name of the author of the document.'
        },
        validator: metaTag => {
            return metaTag.content.length <= 70;
        }
    }, // Document authorship: Specifies the name of the author of the document.
    {
        name: 'og:title',
        content: 'Content Title',
        attributeType: 'property',
        onMissing: {
            type: 'errors',
            message:
                'The og:title meta tag is missing. Add an og:title meta tag to define the title of your content for social media sharing.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The og:title meta tag is invalid. Add a valid og:title meta tag to define the title of your content for social media sharing.'
        },
        validator: metaTag => {
            return metaTag.content.length <= 70;
        }
    }, // Social Media: Defines the title of your content for social media sharing.
    {
        name: 'og:description',
        content: 'Description of the content',
        attributeType: 'property',
        onMissing: {
            type: 'errors',
            message:
                'The og:description meta tag is missing. Add an og:description meta tag to describe your content for social media sharing.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The og:description meta tag is invalid. Add a valid og:description meta tag to describe your content for social media sharing.'
        },
        validator: metaTag => {
            return metaTag.content.length <= 200;
        }
    }, // Social Media: Describes your content for social media sharing.
    {
        name: 'og:image',
        content: 'URL to image',
        attributeType: 'property',
        onMissing: {
            type: 'errors',
            message:
                'The og:image meta tag is missing. Add an og:image meta tag to represent the content in social shares.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The og:image meta tag is invalid. Add a valid og:image meta tag to represent the content in social shares.'
        },
        validator: metaTag => {
            return (
                metaTag.content.startsWith('http') ||
                metaTag.content.startsWith('https')
            );
        }
    }, // Social Media: Specifies an image to represent the content in social shares.
    {
        name: 'og:url',
        content: 'URL of the page',
        attributeType: 'property',
        onMissing: {
            type: 'errors',
            message:
                'The og:url meta tag is missing. Add an og:url meta tag to specify the canonical URL of your page that will be shared.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The og:url meta tag is invalid. Add a valid og:url meta tag to specify the canonical URL of your page that will be shared.'
        },
        validator: metaTag => {
            return (
                metaTag.content.startsWith('http') ||
                metaTag.content.startsWith('https')
            );
        }
    }, // Social Media: The canonical URL of your page that will be shared.
    {
        name: 'og:type',
        content: 'website',
        attributeType: 'property',
        onMissing: {
            type: 'errors',
            message:
                'The og:type meta tag is missing. Add an og:type meta tag to specify the type of your content, e.g., website, article, etc.'
        },
        onInvalid: {
            type: 'errors',
            message:
                'The og:type meta tag is invalid. Add a valid og:type meta tag to specify the type of your content, e.g., website, article, etc.'
        },
        validator: metaTag => {
            return (
                metaTag.content === 'website' || metaTag.content === 'article'
            );
        }
    } // Social Media: The type of your content, e.g., website, article, etc.
];
