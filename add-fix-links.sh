#!/bin/bash

# Add fix-links.js script to all HTML files
for file in *.html; do
  echo "Processing $file..."
  
  # Check if the script is already included
  if grep -q "fix-links.js" "$file"; then
    echo "Script already included in $file"
  else
    # Add the script before the closing body tag
    sed -i 's|</body>|<script src="js/fix-links.js"></script>\n</body>|' "$file"
    echo "Added script to $file"
  fi
done

echo "Done!" 