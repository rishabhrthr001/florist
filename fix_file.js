const fs = require('fs');
const content = fs.readFileSync('/Users/rishabhrathore/Desktop/manga/frontend/pages/MakeYourOwn.tsx', 'utf8');

const oldStr = '            <div className="relative w-fit mx-auto">';
const newStr = '            </div>\n          )}\n      </div>\n\n      <div className="relative w-fit mx-auto">';

const fixedContent = content.replace(oldStr, newStr);

fs.writeFileSync('/Users/rishabhrathore/Desktop/manga/frontend/pages/MakeYourOwn.tsx', fixedContent);
