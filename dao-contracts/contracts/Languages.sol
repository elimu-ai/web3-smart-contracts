// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ILanguages } from "@elimu-ai/dao-contracts/ILanguages.sol";

/// @notice This smart contract stores the languages currently supported by the Ξlimu DAO (see https://github.com/elimu-ai/model).
contract Languages is ILanguages {
    address public owner;

    /// @notice The ISO 639-2 language code of each language, in upper-case letters. E.g. "ENG" for English.
    mapping(string => bool) private languageCodes;

    event OwnerUpdated(address);
    event LanguageCodeAdded(string);
    event LanguageCodeRemoved(string);

    constructor() {
        owner = msg.sender;
    }

    function updateOwner(address owner_) public {
        require(msg.sender == owner, "Only the current owner can set a new owner");
        owner = owner_;
        emit OwnerUpdated(owner_);
    }

    function addSupportedLanguage(string calldata languageCode) external {
        require(msg.sender == owner, "Only the current owner can add a language");
        languageCodes[languageCode] = true;
        emit LanguageCodeAdded(languageCode);
    }

    function removeSupportedLanguage(string calldata languageCode) external {
         require(msg.sender == owner, "Only the current owner can remove a language");
        languageCodes[languageCode] = false;
        emit LanguageCodeRemoved(languageCode);
    }

    function isSupportedLanguage(string calldata languageCode) external view returns (bool) {
        return languageCodes[languageCode];
    }
}
