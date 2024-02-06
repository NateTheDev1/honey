import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { writeFileSync } from 'fs';

export const sitemap = (path: string, ignoreDynamicRoutes: boolean = false) => {
    let fileContent: string = '';
    try {
        fileContent = fs.readFileSync(path, 'utf8');
    } catch (error: any) {
        console.error(`Error reading file: ${path}`);
        console.error(error.message);
        process.exit(1);
    }

    const ast = parse(fileContent, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'] // Adjust if your file uses other syntax/features
    });

    const routes: { path: string; lastMod?: string }[] = [];

    traverse(ast, {
        CallExpression(path: any) {
            if (
                path.node.callee.object &&
                path.node.callee.object.name === 'honey' &&
                path.node.callee.property.name === 'renderRouter'
            ) {
                const argument = path.node.arguments[0]; // Assuming the first argument is the config object
                if (argument && argument.type === 'ObjectExpression') {
                    argument.properties.forEach((prop: any) => {
                        if (
                            prop.key.name === 'paths' &&
                            prop.value.type === 'ArrayExpression'
                        ) {
                            prop.value.elements.forEach((element: any) => {
                                if (element.type === 'ObjectExpression') {
                                    const pathObject: {
                                        path: string;
                                        lastMod?: string;
                                    } = { path: '', lastMod: undefined };
                                    element.properties.forEach((prop: any) => {
                                        if (
                                            prop.key.name === 'path' &&
                                            prop.value.type === 'StringLiteral'
                                        ) {
                                            if (
                                                !ignoreDynamicRoutes ||
                                                !prop.value.value.includes(':')
                                            ) {
                                                pathObject.path =
                                                    prop.value.value;
                                            }
                                        } else if (
                                            prop.key.name === 'lastMod' &&
                                            prop.value.type === 'CallExpression'
                                        ) {
                                            throw new Error(
                                                'lastMod cannot be a function call. lastMod should be a string literal.'
                                            );
                                        } else if (
                                            prop.key.name === 'lastMod' &&
                                            prop.value.type === 'StringLiteral'
                                        ) {
                                            pathObject.lastMod =
                                                prop.value.value;
                                        }
                                    });
                                    if (pathObject.path) {
                                        // Ensure we only push routes with a path
                                        routes.push(pathObject);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });

    // Generate sitemap
    const sitemapContent = routes
        .map(
            route =>
                `<url><loc>${route.path}</loc>${
                    route.lastMod ? `<lastmod>${route.lastMod}</lastmod>` : ''
                }</url>`
        )
        .join('\n');
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapContent}
</urlset>`;

    // Save sitemap to file
    writeFileSync('public/sitemap.xml', sitemapXml);
    console.log('Sitemap generated successfully.');
};
