import { DOMParser } from 'xmldom'
const dom = new DOMParser()
export const XML_PARSER_FN = (str: string) => dom.parseFromString(str, 'application/xml')