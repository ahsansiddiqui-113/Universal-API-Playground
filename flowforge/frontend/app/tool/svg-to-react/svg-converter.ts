/**
 * lib/tools/svg-to-react.ts
 * Pure function — converts SVG markup to a React/TypeScript component.
 */

export interface SvgToReactOptions {
    typescript?: boolean;       // output .tsx with interface
    componentName?: string;     // default: 'SvgIcon'
    memoize?: boolean;          // wrap in React.memo
    addTitleProp?: boolean;     // add accessible title prop
    makeResponsive?: boolean;   // remove fixed width/height, add className prop
}

// Attributes that need camelCase conversion
const ATTR_MAP: Record<string, string> = {
    'class': 'className',
    'for': 'htmlFor',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-miterlimit': 'strokeMiterlimit',
    'fill-opacity': 'fillOpacity',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'clip-path': 'clipPath',
    'font-size': 'fontSize',
    'font-family': 'fontFamily',
    'font-weight': 'fontWeight',
    'letter-spacing': 'letterSpacing',
    'text-anchor': 'textAnchor',
    'dominant-baseline': 'dominantBaseline',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'gradient-units': 'gradientUnits',
    'gradient-transform': 'gradientTransform',
    'pattern-units': 'patternUnits',
    'pattern-transform': 'patternTransform',
    'marker-end': 'markerEnd',
    'marker-start': 'markerStart',
    'marker-mid': 'markerMid',
    'xlink:href': 'href',       // modern React: drop xlink namespace
    'xml:space': 'xmlSpace',
    'xmlns:xlink': '',           // remove — React doesn't need this
    'tabindex': 'tabIndex',
    'viewbox': 'viewBox',    // lowercase in HTML but camelCase in JSX
};

function convertAttributes(svgStr: string, opts: SvgToReactOptions): string {
    let result = svgStr;

    // Remove xmlns:xlink (React handles this internally)
    result = result.replace(/\s+xmlns:xlink="[^"]*"/g, '');

    // Replace each known kebab-case attr with camelCase
    for (const [from, to] of Object.entries(ATTR_MAP)) {
        if (!to) {
            result = result.replace(new RegExp(`\\s+${escapeRe(from)}="[^"]*"`, 'g'), '');
            continue;
        }
        result = result.replace(
            new RegExp(`\\b${escapeRe(from)}=`, 'g'),
            `${to}=`,
        );
    }

    // Convert inline style="..." strings to JSX style={{...}}
    result = result.replace(/style="([^"]*)"/g, (_match, styleStr: string) => {
        const styleObj = styleStr
            .split(';')
            .filter(Boolean)
            .map(decl => {
                const [prop, ...rest] = decl.split(':');
                const key = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
                const val = rest.join(':').trim();
                return `${key}: '${val}'`;
            })
            .join(', ');
        return `style={{ ${styleObj} }}`;
    });

    // Make responsive: replace fixed width/height on <svg> with className spread
    if (opts.makeResponsive) {
        result = result.replace(/<svg([^>]*)>/, (_match, attrs: string) => {
            const cleaned = attrs
                .replace(/\s+width="[^"]*"/, '')
                .replace(/\s+height="[^"]*"/, '');
            return `<svg${cleaned} className={className}>`;
        });
    }

    return result;
}

function escapeRe(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function svgToReact(svgString: string, opts: SvgToReactOptions = {}): string {
    const {
        typescript = true,
        componentName = 'SvgIcon',
        memoize = false,
        addTitleProp = false,
        makeResponsive = true,
    } = opts;

    // Basic cleanup
    let svg = svgString.trim();

    // Remove XML declaration and DOCTYPE if present
    svg = svg.replace(/<\?xml[^>]*\?>/g, '').trim();
    svg = svg.replace(/<!DOCTYPE[^>]*>/g, '').trim();

    // Convert attributes
    svg = convertAttributes(svg, { ...opts, makeResponsive });

    // If adding title prop, inject {title && <title>{title}</title>} after <svg...>
    if (addTitleProp) {
        svg = svg.replace(/<svg([^>]*)>/, `<svg$1>\n      {title && <title>{title}</title>}`);
    }

    // Indent SVG content for readability inside the return statement
    const indented = svg.split('\n').map((line, i) => i === 0 ? `      ${line}` : `      ${line}`).join('\n');

    // Build props interface
    const tsProps = typescript ? `
interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  ${addTitleProp ? 'title?: string;' : ''}
  ${makeResponsive ? 'className?: string;' : ''}
}
` : '';

    const propsType = typescript ? `: ${componentName}Props` : '';
    const propParam = [
        makeResponsive ? 'className' : '',
        addTitleProp ? 'title' : '',
        '...props',
    ].filter(Boolean).join(', ');

    const component = `function ${componentName}({ ${propParam} }${propsType}) {
  return (
${indented}
  );
}`;

    const exported = memoize
        ? `const ${componentName} = React.memo(${component.replace(`function ${componentName}`, 'function')})\nexport default ${componentName};`
        : `${component}\nexport default ${componentName};`;

    const imports = typescript
        ? `import React from 'react';\n`
        : `import React from 'react';\n`;

    return [imports, tsProps, exported].filter(Boolean).join('\n');
}