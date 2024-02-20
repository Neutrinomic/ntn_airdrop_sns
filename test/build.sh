#!/bin/sh

# Ensure the build directory exists
mkdir -p ./build

# Export PATH or any other environment variables if necessary to ensure commands are found
# export PATH="/path/to/your/commands:$PATH"


  # Extract the base name without the directory and .test.mo extension
  base_name="main";
  
  echo "Processing $base_name...";
  
  # Run moc to produce the wasm file. Adjust the moc command as necessary.
  `NODE_OPTIONS="--no-deprecation" npx mocv bin`/moc `mops sources` --idl --hide-warnings --error-detail 0 -o "./build/${base_name}.wasm" --idl ../src/main.mo 1>/dev/null 2>/dev/null &&
  
  # Assuming main.did is produced by the above moc command and matches the base name.
  # Generate JavaScript bindings
  didc bind "./build/${base_name}.did" --target js > "./build/${base_name}.idl.js" &&
  
  # Generate TypeScript bindings
  didc bind "./build/${base_name}.did" --target ts > "./build/${base_name}.idl.d.ts" ;
  
  echo "Finished processing $base_name"
