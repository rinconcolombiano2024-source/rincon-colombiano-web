import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChatPayload } from '../src/components/rincon-ai/chat-payload.ts';
test('long multilingual chats remain within the API byte limit and keep newest context',()=>{
  for(const value of ['a','ó','🙂','"','\\']){
    const messages=Array.from({length:20},(_,i)=>({role:'user',text:`${i}: ${value.repeat(800)}`}));
    const raw=buildChatPayload(value.repeat(800),'pl',messages);
    assert.ok(Buffer.byteLength(raw)<=5000);
    const body=JSON.parse(raw);
    assert.ok(body.history.length<=6);
    if(body.history.length){assert.ok(body.history.at(-1).text.startsWith('19:'));}
  }
});
