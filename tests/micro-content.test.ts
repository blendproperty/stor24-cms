import test from 'node:test'
import assert from 'node:assert/strict'
import { validateMicroContent } from '../src/globals/MicroWarehousing'

test('Micro content accepts supported edits/clearing and rejects shapes that break page/schema correspondence', () => {
 for (const value of [null, undefined, {}, {faqs:[],facilities:{}}, {faqs:null,facilities:null}, {faqs:[{question:'What can I store?',answer:'Discuss the space with us.'}],facilities:{midpoint:'Ground-floor storage.'}}]) assert.equal(validateMicroContent(value),true)
 for (const value of ['FAQ text', [], 1, {faqs:'not an array'}, {faqs:[null]}, {faqs:[{question:'Question',answer:''}]}, {faqs:[{question:{text:'Question'},answer:'Answer'}]}, {facilities:[]}, {facilities:{midpoint:{text:'Invalid object'}}}]) assert.equal(typeof validateMicroContent(value),'string')
})
