stream messages from the backend

## part 1

```
data: {"type":"start","messageId":"PmZYLHGwrQGT8Ktm"}

data: {"type":"start-step"}

data: {"type":"reasoning-start","id":"0"}

data: {"type":"reasoning-delta","id":"0","delta":"**Considering the Echo Function**\n\nI'm now zeroing in on the correct function for this task: `everything__echo`. My understanding is that its `message` parameter should precisely be \"hello world\". This seems straightforward, but I'm just double-checking to ensure there's no subtle nuance I'm missing.\n\n\n"}

data: {"type":"tool-input-start","toolCallId":"U2Cb59vETmDnsB5i","toolName":"everything__echo"}

data: {"type":"tool-input-delta","toolCallId":"U2Cb59vETmDnsB5i","inputTextDelta":"{\"message\":\"hello world\"}"}

data: {"type":"tool-input-available","toolCallId":"U2Cb59vETmDnsB5i","toolName":"everything__echo","input":{"message":"hello world"}}

data: {"type":"reasoning-end","id":"0"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"tool-calls"}

data: [DONE]
```

## part 2

```
data: {"type":"tool-output-available","toolCallId":"U2Cb59vETmDnsB5i","output":"Error: User denied access to tool execution"}

data: {"type":"start","messageId":"PmZYLHGwrQGT8Ktm"}

data: {"type":"start-step"}

data: {"type":"text-start","id":"0"}

data: {"type":"text-delta","id":"0","delta":"I"}

data: {"type":"text-delta","id":"0","delta":" am sorry, I cannot fulfill this request. The execution of the tool was denied by"}

data: {"type":"text-delta","id":"0","delta":" the user."}

data: {"type":"text-end","id":"0"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"stop"}

data: [DONE]
```
