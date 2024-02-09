import { HoneyTree } from './renderer';
import { importantMetaTags } from './constants';

export type HoneyReportType = 'SEO' | 'Performance' | 'Accessibility';

type SEOReport = {
    errors: string[];
    warnings: string[];
    score: number;
};

export type HoneyReport = {
    type: HoneyReportType;
    overallScore: number;
    seo?: SEOReport;
};

export const createHoneySEOReport = () => {
    const seoReport: HoneyReport = {
        type: 'SEO',
        overallScore: 0
    };

    seoReport.seo = analyzeMetaInformation();

    return seoReport;
};

const analyzeMetaInformation = (): SEOReport => {
    const report: {
        errors: string[];
        warnings: string[];
        score: number;
    } = {
        errors: [],
        warnings: [],
        score: 0
    };

    // Check the page for important meta tags

    for (const tag of importantMetaTags) {
        const metaTag = document.querySelector(`meta[name='${tag.name}']`);
        if (!metaTag) {
            if (report[tag.onMissing.type]) {
                report[tag.onMissing.type].push(tag.onMissing.message);
            }
        } else {
            // Check the content of the meta tag
            if (tag.validator) {
                const isValid = tag.validator(metaTag as HTMLMetaElement);
                if (!isValid) {
                    if (report[tag.onInvalid.type]) {
                        report[tag.onInvalid.type].push(tag.onInvalid.message);
                    }
                }
            }
        }
    }

    // Determine Score
    const errors = report.errors.length;
    const warnings = report.warnings.length;

    report.score = 100 - (errors + warnings);

    return report;
};
