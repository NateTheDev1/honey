import { getCurrentRenderingComponent } from '../../globalState';
import { createHoneySEOReport } from '../../reporter';
import { styleizeLog } from '../../utils/styleizeLog';

let loggedReport = false;

/**
 * Create an SEO report for the entire app. Can be placed anywhere. Should be called once per page load.
 * @param rootElementId
 */
export const createSEOReport = () => {
    if (loggedReport) return;

    const report = createHoneySEOReport();

    if (report.seo) {
        console.groupCollapsed('Honey SEO Report');

        console.log(
            `%cHoney SEO Report: Overall Score: ${report.seo.score}`,
            'color: #4CAF50; font-size: 20px; font-weight: bold; background-color: #f2f2f2; padding: 10px; border-radius: 5px; border: 1px solid #4CAF50;'
        );

        console.log(
            `%cHoney SEO Report: Errors: ${report.seo.errors.length}`,
            'color: #f44336; font-size: 20px; font-weight: bold; background-color: #f2f2f2; padding: 10px; border-radius: 5px; border: 1px solid #f44336;'
        );

        console.log(
            `%cHoney SEO Report: Warnings: ${report.seo.warnings.length}`,
            'color: #FFC107; font-size: 20px; font-weight: bold; background-color: #f2f2f2; padding: 10px; border-radius: 5px; border: 1px solid #FFC107;'
        );

        // Errors
        if (report.seo.errors.length > 0) {
            console.groupCollapsed('Honey SEO Report: Errors');
            report.seo.errors.forEach(error => {
                console.error(error);
            });
            console.groupEnd();
        }

        // Warnings
        if (report.seo.warnings.length > 0) {
            console.groupCollapsed('Honey SEO Report: Warnings');
            report.seo.warnings.forEach(warning => {
                console.warn(warning);
            });
            console.groupEnd();
        }

        console.groupEnd();
    }
};
