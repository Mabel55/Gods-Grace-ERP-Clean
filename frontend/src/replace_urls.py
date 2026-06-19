import os
import re

src_dir = r"c:\Users\USER\Desktop\God's grace\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Check if we need to add the API_BASE_URL constant
    if '"http://localhost:8000' in content or "'http://localhost:8000" in content or "`http://localhost:8000" in content:
        
        # Add the constant if it's not already in the file
        if "const API_BASE_URL =" not in content:
            # Find the last import statement
            imports = list(re.finditer(r'^import .*;?$', content, re.MULTILINE))
            if imports:
                last_import_end = imports[-1].end()
                content = content[:last_import_end] + '\n\nconst API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";\n' + content[last_import_end:]
            else:
                # If no imports, put it at the top
                content = 'const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";\n\n' + content

        # Replace double quote URLs: "http://localhost:8000/path" -> `${API_BASE_URL}/path`
        content = re.sub(r'"http://localhost:8000(/.*?)"', r'`${API_BASE_URL}\1`', content)
        content = re.sub(r'"http://localhost:8000"', r'`${API_BASE_URL}`', content)
        
        # Replace single quote URLs: 'http://localhost:8000/path' -> `${API_BASE_URL}/path`
        content = re.sub(r"'http://localhost:8000(/.*?)'", r'`${API_BASE_URL}\1`', content)
        content = re.sub(r"'http://localhost:8000'", r'`${API_BASE_URL}`', content)

        # Replace inside backticks: `http://localhost:8000/path/${id}` -> `${API_BASE_URL}/path/${id}`
        content = content.replace("`http://localhost:8000", "`${API_BASE_URL}")
        
        # Exceptions where it might have doubled up (if they had already done some replacements)
        # We don't want to replace if it's the definition of API_BASE_URL itself
        # The regex above will replace the definition if we aren't careful, so let's fix it back
        content = content.replace('const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;', 'const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";')
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
