import * as fs from 'fs';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-preprocessor';
import { HardhatUserConfig } from 'hardhat/config';

function getRemappings() {
    return fs
        .readFileSync('remappings.txt', 'utf8')
        .split('\n')
        .filter(Boolean) // remove empty lines
        .map((line) => line.trim().split('='));
}

const config: HardhatUserConfig = {
    solidity: '0.8.13',
    paths: {
        sources: './src', // Use ./src rather than ./contracts as Hardhat expects
        cache: './cache_hardhat', // Use a different cache for Hardhat than Foundry
    },
    preprocess: {
        eachLine: () => ({
            transform: (line: string) => {
                if (line.match(/^\s*import /i)) {
                    for (const [from, to] of getRemappings()) {
                        if (line.includes(from)) {
                            line = line.replace(from, to);
                            break;
                        }
                    }
                }
                return line;
            },
        }),
    }
};

export default config;
