// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ILanguages} from "./interfaces/ILanguages.sol";

/// @notice This smart contract is the on-chain version of https://github.com/elimu-ai/model/blob/main/src/main/java/ai/elimu/model/v2/enums/Language.java
contract Languages is ILanguages {
    /// @notice The ISO 639-2 language code of each language supported by the DAO.
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
