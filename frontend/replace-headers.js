const fs = require('fs');
const glob = require('glob');
const files = glob.sync('frontend/src/app/**/*.tsx');
let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We only want to attempt replacement if a <header> is present
    if (!content.includes('<header')) return;

    let hasChanges = false;
    let newContent = content;

    // Standard headers
    const headerRegex = /<header className="flex h-\[72px\][^>]*>[\s\S]*?<\/header>/g;
    
    newContent = newContent.replace(headerRegex, (match) => {
        let backHref = '""';
        let backLabel = '""';
        
        const linkMatch = match.match(/href=["']([^"']+)["']/);
        if (linkMatch) backHref = `"${linkMatch[1]}"`;
        
        let labelMatch = match.match(/{(t\([^)]+\))}/);
        if (labelMatch) {
            backLabel = `{${labelMatch[1]}}`;
        } else if (match.includes('←')) {
            backLabel = '"Back"';
        }

        let isDashboard = match.includes('bg-[#0E274A]');
        let showNotifications = match.includes('<Bell');

        hasChanges = true;
        let props = [];
        if (backHref !== '""') props.push(`backHref=${backHref}`);
        if (backLabel !== '""') props.push(`backLabel=${backLabel}`);
        if (isDashboard) props.push('className="bg-[#0E274A]"');
        if (showNotifications) props.push('showNotifications');

        return `<AppHeader ${props.join(' ')} />`;
    });

    // Tournament headers
    const tournamentHeaderRegex = /<header className="bg-\[#0b3372\][^>]*>[\s\S]*?<\/header>/g;
    
    newContent = newContent.replace(tournamentHeaderRegex, (match) => {
        let backHref = '""';
        let backLabel = '""';
        
        const linkMatch = match.match(/href=["']([^"']+)["']/);
        if (linkMatch) backHref = `"${linkMatch[1]}"`;
        
        let labelMatch = match.match(/{(t\([^)]+\))}/);
        if (labelMatch) {
            backLabel = `{${labelMatch[1]}}`;
        } else if (match.includes('←') || match.includes('ArrowLeft')) {
            backLabel = '"{t(\\"tournament.back\\")}"'; // default
        }

        let showLanguage = match.includes('setLanguage');

        hasChanges = true;
        let props = [];
        if (backHref !== '""') props.push(`backHref=${backHref}`);
        if (backLabel !== '""') props.push(`backLabel=${backLabel}`);
        props.push('className="bg-[#0b3372] shadow-md"');
        if (showLanguage) props.push('showLanguageToggle');

        return `<AppHeader ${props.join(' ')} />`;
    });
    
    // Meet header (very custom, might keep it or not, but it says <header className="flex h-[56px] ...)
    
    if (hasChanges && newContent !== content) {
        if (!newContent.includes('AppHeader')) {
            // Add import after last import
            const idx = newContent.lastIndexOf('import ');
            const nLine = newContent.indexOf('\\n', idx);
            if (nLine !== -1) {
                newContent = newContent.slice(0, nLine + 1) + 'import AppHeader from "@/components/shared/AppHeader";\\n' + newContent.slice(nLine + 1);
            } else {
                newContent = 'import AppHeader from "@/components/shared/AppHeader";\\n' + newContent;
            }
        }
        
        // Let's actually ensure AppHeader import is clean and handles Windows CRLF
        // Simpler: Just prepend it if it's missing
        if (!newContent.includes('@/components/shared/AppHeader')) {
             newContent = newContent.replace(/import [^\n]+;\r?\n/, (m) => m + 'import AppHeader from "@/components/shared/AppHeader";\n');
        }

        fs.writeFileSync(file, newContent, 'utf8');
        updated++;
        console.log("Updated", file);
    }
});
console.log("Total files updated:", updated);