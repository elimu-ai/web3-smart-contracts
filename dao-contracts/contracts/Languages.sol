// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ILanguages } from "@elimu-ai/dao-contracts/ILanguages.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice This smart contract stores the languages currently supported by the Ξlimu DAO (see https://github.com/elimu-ai/model).
contract Languages is ILanguages, Ownable {
    /// @notice The ISO 639-2 language code of each language, in upper-case letters. E.g. "ENG" for English.
    mapping(string => bool) private languageCodes;

    event LanguageCodeAdded(string);
    event LanguageCodeRemoved(string);

    constructor() Ownable(msg.sender) {}

    function addSupportedLanguage(string calldata languageCode) external onlyOwner {
        languageCodes[languageCode] = true;
        emit LanguageCodeAdded(languageCode);
    }

    function removeSupportedLanguage(string calldata languageCode) external onlyOwner {
        languageCodes[languageCode] = false;
        emit LanguageCodeRemoved(languageCode);
    }

    function isSupportedLanguage(string calldata languageCode) external view returns (bool) {
        return languageCodes[languageCode];
    }
}
