const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src', { recursive: true }).filter(f => f.endsWith('.tsx'));

let modifiedCount = 0;

files.forEach(f => {
  const filePath = path.join('src', f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('import { colors }') || content.includes('colors.')) {
    // Determine path to useTheme. 'src' has depth 0 relative to src.
    const depth = f.split(path.sep).length - 1;
    let up = '../'.repeat(depth);
    if (up === '') up = './';
    
    // Replace import
    let newContent = content.replace(/import\s+\{\s*colors\s*\}\s+from\s+['"][^'"]+colors['"];?/g, `import { useTheme } from '${up}theme/useTheme';`);
    
    if (newContent !== content) {
      // Find functional component signature including multiline args and object destructuring
      const componentRegex = /export const \w+[:\.\sA-Za-z<,>]*=[\s\S]*?=>\s*\{/;
      const match = newContent.match(componentRegex);
      
      if (match) {
        const sig = match[0];
        
        // Add hook
        if (!newContent.includes('const { colors } = useTheme();')) {
          newContent = newContent.replace(sig, `${sig}\n  const { colors } = useTheme();`);
        }
        
        // Rewrite StyleSheet
        if (newContent.includes('const styles = StyleSheet.create(')) {
          newContent = newContent.replace(/const styles = StyleSheet\.create\(/g, 'const getStyles = (colors: any) => StyleSheet.create(');
          newContent = newContent.replace(sig, `${sig}\n  const styles = getStyles(colors);`);
        }
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedCount++;
        console.log('Modified:', filePath);
      } else {
        console.log('No component signature found in', filePath);
      }
    }
  }
});

console.log(`Modified ${modifiedCount} files.`);
