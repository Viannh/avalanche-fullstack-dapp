#!/usr/bin/env node

/**
 * Helper script to update frontend contract address after deployment
 * 
 * Usage:
 *   node update-contract-address.js 0xYourContractAddress
 * 
 * Or if deployment_info.json exists:
 *   node update-contract-address.js
 */

const fs = require('fs');
const path = require('path');

// Get contract address from command line or deployment_info.json
let contractAddress = process.argv[2];

if (!contractAddress) {
    // Try to read from deployment_info.json
    const deploymentInfoPath = path.join(__dirname, '../../contracts/deployment_info.json');

    if (fs.existsSync(deploymentInfoPath)) {
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
        contractAddress = deploymentInfo.address;
        console.log('✅ Found contract address in deployment_info.json');
    } else {
        console.error('❌ Error: No contract address provided and deployment_info.json not found');
        console.log('\nUsage:');
        console.log('  node update-contract-address.js 0xYourContractAddress');
        console.log('\nOr deploy the contract first:');
        console.log('  cd ../contracts');
        console.log('  npx hardhat run scripts/deployments.ts --network fuji');
        process.exit(1);
    }
}

// Validate address format
if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    console.error('❌ Error: Invalid Ethereum address format');
    console.log('Address should be 42 characters starting with 0x');
    process.exit(1);
}

// Update contract.ts file
const contractFilePath = path.join(__dirname, 'app/contract.ts');

if (!fs.existsSync(contractFilePath)) {
    console.error('❌ Error: contract.ts not found at', contractFilePath);
    process.exit(1);
}

let contractFileContent = fs.readFileSync(contractFilePath, 'utf8');

// Replace the contract address
const oldAddressRegex = /export const CONTRACT_ADDRESS = '0x[a-fA-F0-9]{40,}' as const;/;
const placeholderRegex = /export const CONTRACT_ADDRESS = '0xYourContractAddressHere' as const;/;

const newLine = `export const CONTRACT_ADDRESS = '${contractAddress}' as const;`;

if (contractFileContent.match(oldAddressRegex)) {
    contractFileContent = contractFileContent.replace(oldAddressRegex, newLine);
} else if (contractFileContent.match(placeholderRegex)) {
    contractFileContent = contractFileContent.replace(placeholderRegex, newLine);
} else {
    console.error('❌ Error: Could not find CONTRACT_ADDRESS line to replace');
    process.exit(1);
}

// Write back to file
fs.writeFileSync(contractFilePath, contractFileContent, 'utf8');

console.log('✅ Contract address updated successfully!');
console.log(`📝 Address: ${contractAddress}`);
console.log(`📁 File: ${contractFilePath}`);
console.log('\n🎉 You can now run the frontend:');
console.log('   npm run dev');
console.log('\n🔗 View on Snowtrace:');
console.log(`   https://testnet.snowtrace.io/address/${contractAddress}`);
