// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ILanguages} from "./interfaces/ILanguages.sol";

/// @notice This smart contract stores the languages currently supported by the Ξlimu DAO
contract Languages is ILanguages {
    /// @notice The ISO 639-2 language code of each language
    mapping(string => bool) public languageCodes;

    function addSupportedLanguage(string calldata languageCode) external {
        languageCodes[languageCode] = true;
    }

    function removeSupportedLanguage(string calldata languageCode) external {
        languageCodes[languageCode] = false;
    }

    function isSupportedLanguage(string calldata languageCode) external view returns (bool) {
        return languageCodes[languageCode];
    }
}
