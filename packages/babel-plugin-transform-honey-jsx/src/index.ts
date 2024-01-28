import { PluginObj, PluginPass } from '@babel/core';
import * as t from '@babel/types';

interface Babel {
    types: typeof t;
}

export default function (babel: Babel): PluginObj<PluginPass> {
    const { types: t } = babel;

    return {
        visitor: {
            JSXElement(path) {
                const openingElement = path.node.openingElement;
                const attributes = openingElement.attributes
                    .map(attr => {
                        if (t.isJSXSpreadAttribute(attr)) {
                            return t.spreadElement(attr.argument);
                        } else {
                            const name = t.isJSXNamespacedName(attr.name)
                                ? `${attr.name.namespace.name}:${attr.name.name.name}`
                                : attr.name.name;
                            let value: t.Expression | t.BooleanLiteral | null =
                                null;

                            if (attr.value) {
                                if (t.isJSXExpressionContainer(attr.value)) {
                                    if (
                                        !t.isJSXEmptyExpression(
                                            attr.value.expression
                                        )
                                    ) {
                                        value = attr.value.expression;
                                    }
                                } else {
                                    value = attr.value as t.Expression;
                                }
                            } else {
                                value = t.booleanLiteral(true);
                            }

                            if (value) {
                                return t.objectProperty(
                                    t.stringLiteral(name),
                                    value
                                );
                            }
                        }
                    })
                    .filter(Boolean); // Remove undefined values

                const props = t.objectExpression(
                    attributes.filter(
                        attr => attr !== undefined
                    ) as t.ObjectProperty[]
                );

                const children = path.node.children
                    .map(child => {
                        if (t.isJSXText(child)) {
                            return t.stringLiteral(child.value.trim());
                        } else if (t.isJSXExpressionContainer(child)) {
                            return child.expression;
                        } else if (t.isJSXSpreadChild(child)) {
                            // Handle spread child appropriately
                            return null;
                        } else {
                            return child;
                        }
                    })
                    .filter(
                        (child): child is t.Expression =>
                            child !== null && !t.isJSXEmptyExpression(child)
                    );

                let typeName: string;
                if (t.isJSXIdentifier(openingElement.name)) {
                    typeName = openingElement.name.name;
                } else if (t.isJSXMemberExpression(openingElement.name)) {
                    typeName = getMemberExpressionName(openingElement.name);
                } else {
                    // Handle namespaced name or any other types
                    typeName = 'unknownType';
                }

                const type = t.stringLiteral(typeName);
                const args = [type, props, ...children];
                const createElementCall = t.callExpression(
                    t.memberExpression(
                        t.identifier('honey'),
                        t.identifier('createElement')
                    ),
                    args
                );

                path.replaceWith(createElementCall);
            }
        }
    };
}

function getMemberExpressionName(memberExpr: t.JSXMemberExpression): string {
    let objectName: string;

    if (t.isJSXMemberExpression(memberExpr.object)) {
        objectName = getMemberExpressionName(memberExpr.object);
    } else {
        objectName = (memberExpr.object as t.JSXIdentifier).name;
    }

    const propertyName = (memberExpr.property as t.JSXIdentifier).name;
    return `${objectName}.${propertyName}`;
}
