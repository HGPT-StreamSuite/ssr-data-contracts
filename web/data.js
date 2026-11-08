// Generated from this repo; node tools/build_workbench.mjs
window.SSRContractData = {
  "schemas": {
    "answer-prompt-input.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Answer Prompt Input v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "run_id",
        "message_id",
        "context_snapshot",
        "analysis",
        "query_results"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.answer-prompt-input.v1"
        },
        "run_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "context_snapshot": {
          "$ref": "context-snapshot.schema.json"
        },
        "analysis": {
          "$ref": "question-analysis.schema.json"
        },
        "query_results": {
          "type": "array",
          "items": {
            "$ref": "query-result.schema.json"
          }
        }
      }
    },
    "answer-run-record.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Answer Run Record v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "run_id",
        "message_id",
        "started_at",
        "status",
        "query_executions"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.answer-run-record.v1"
        },
        "run_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "started_at": {
          "type": "string",
          "format": "date-time"
        },
        "completed_at": {
          "type": "string",
          "format": "date-time"
        },
        "status": {
          "enum": [
            "running",
            "completed",
            "failed"
          ]
        },
        "context_snapshot_id": {
          "type": "string",
          "minLength": 1
        },
        "query_executions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "query_id",
              "query_type",
              "status"
            ],
            "properties": {
              "query_id": {
                "type": "string",
                "minLength": 1
              },
              "query_type": {
                "enum": [
                  "weather",
                  "person",
                  "game_info",
                  "game_guide",
                  "game_item"
                ]
              },
              "status": {
                "enum": [
                  "ok",
                  "no_match",
                  "unavailable",
                  "error"
                ]
              }
            }
          }
        },
        "gap_record_ids": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      }
    },
    "chat-event.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Chat Event v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "ingest_id",
        "message_id",
        "occurred_at",
        "conversation_id",
        "source",
        "actor",
        "text"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.chat-event.v1"
        },
        "ingest_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "occurred_at": {
          "type": "string",
          "format": "date-time"
        },
        "conversation_id": {
          "type": "string",
          "minLength": 1
        },
        "source": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "platform",
            "channel_id"
          ],
          "properties": {
            "platform": {
              "type": "string",
              "minLength": 1
            },
            "channel_id": {
              "type": "string",
              "minLength": 1
            }
          }
        },
        "actor": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "actor_id",
            "role"
          ],
          "properties": {
            "actor_id": {
              "type": "string",
              "minLength": 1
            },
            "display_name": {
              "type": "string"
            },
            "role": {
              "enum": [
                "viewer",
                "streamer",
                "assistant"
              ]
            }
          }
        },
        "text": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "context-snapshot.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Conversation Context Snapshot v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "snapshot_id",
        "conversation_id",
        "source",
        "generated_at",
        "messages"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.context-snapshot.v1"
        },
        "snapshot_id": {
          "type": "string",
          "minLength": 1
        },
        "conversation_id": {
          "type": "string",
          "minLength": 1
        },
        "source": {
          "const": "ssr-conversation-store"
        },
        "generated_at": {
          "type": "string",
          "format": "date-time"
        },
        "messages": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "message_id",
              "occurred_at",
              "role",
              "text"
            ],
            "properties": {
              "message_id": {
                "type": "string",
                "minLength": 1
              },
              "occurred_at": {
                "type": "string",
                "format": "date-time"
              },
              "role": {
                "enum": [
                  "viewer",
                  "streamer",
                  "assistant"
                ]
              },
              "text": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "ingest-attempt.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Ingest Attempt v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "ingest_id",
        "received_at",
        "source",
        "raw_event",
        "validation"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.ingest-attempt.v1"
        },
        "ingest_id": {
          "type": "string",
          "minLength": 1
        },
        "received_at": {
          "type": "string",
          "format": "date-time"
        },
        "source": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "platform"
          ],
          "properties": {
            "platform": {
              "type": "string",
              "minLength": 1
            },
            "channel_id": {
              "type": "string",
              "minLength": 1
            }
          }
        },
        "raw_event": {
          "type": "object"
        },
        "validation": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "status",
            "reason_codes"
          ],
          "properties": {
            "status": {
              "enum": [
                "valid",
                "invalid"
              ]
            },
            "reason_codes": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "normalized_event": {
          "$ref": "chat-event.schema.json"
        }
      }
    },
    "query-request.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Query Request v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "query_id",
        "run_id",
        "message_id",
        "question_id",
        "query_type",
        "query_text"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.query-request.v1"
        },
        "query_id": {
          "type": "string",
          "minLength": 1
        },
        "run_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "question_id": {
          "type": "string",
          "minLength": 1
        },
        "query_type": {
          "enum": [
            "weather",
            "person",
            "game_info",
            "game_guide",
            "game_item"
          ]
        },
        "query_text": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "query-result.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Query Result v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "query_id",
        "run_id",
        "message_id",
        "question_id",
        "query_type",
        "status",
        "materials",
        "sources"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.query-result.v1"
        },
        "query_id": {
          "type": "string",
          "minLength": 1
        },
        "run_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "question_id": {
          "type": "string",
          "minLength": 1
        },
        "query_type": {
          "enum": [
            "weather",
            "person",
            "game_info",
            "game_guide",
            "game_item"
          ]
        },
        "status": {
          "enum": [
            "ok",
            "no_match",
            "unavailable",
            "error"
          ]
        },
        "materials": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "material_id",
              "title",
              "content",
              "source_ids"
            ],
            "properties": {
              "material_id": {
                "type": "string",
                "minLength": 1
              },
              "title": {
                "type": "string",
                "minLength": 1
              },
              "content": {
                "type": "string"
              },
              "source_ids": {
                "type": "array",
                "items": {
                  "type": "string",
                  "minLength": 1
                }
              },
              "knowledge_version": {
                "type": "string",
                "minLength": 1
              }
            }
          }
        },
        "sources": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "source_id",
              "source_type",
              "locator"
            ],
            "properties": {
              "source_id": {
                "type": "string",
                "minLength": 1
              },
              "source_type": {
                "enum": [
                  "wiki",
                  "web",
                  "api",
                  "other"
                ]
              },
              "locator": {
                "type": "string",
                "minLength": 1
              },
              "observed_at": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        }
      }
    },
    "question-analysis.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Question Analysis v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "analysis_id",
        "run_id",
        "message_id",
        "context_snapshot_id",
        "questions"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.question-analysis.v1"
        },
        "analysis_id": {
          "type": "string",
          "minLength": 1
        },
        "run_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "context_snapshot_id": {
          "type": "string",
          "minLength": 1
        },
        "questions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "question_id",
              "query_type",
              "question_text"
            ],
            "properties": {
              "question_id": {
                "type": "string",
                "minLength": 1
              },
              "query_type": {
                "enum": [
                  "weather",
                  "person",
                  "game_info",
                  "game_guide",
                  "game_item"
                ]
              },
              "question_text": {
                "type": "string",
                "minLength": 1
              }
            }
          }
        }
      }
    },
    "routing-decision.schema.json": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "SSR Routing Decision v0.1",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schema_version",
        "ingest_id",
        "disposition",
        "next_step",
        "reason_codes"
      ],
      "properties": {
        "schema_version": {
          "const": "ssr.routing-decision.v1"
        },
        "ingest_id": {
          "type": "string",
          "minLength": 1
        },
        "message_id": {
          "type": "string",
          "minLength": 1
        },
        "disposition": {
          "enum": [
            "invalid",
            "not_triggered",
            "triggered"
          ]
        },
        "next_step": {
          "enum": [
            "fixed_sop",
            "question_analysis"
          ]
        },
        "reason_codes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  },
  "examples": [
    {
      "name": "ingest-attempt.example.json",
      "schema": "ingest-attempt.schema.json",
      "value": {
        "schema_version": "ssr.ingest-attempt.v1",
        "ingest_id": "ing-2026-0001",
        "received_at": "2026-10-17T09:30:00Z",
        "source": {
          "platform": "example-chat",
          "channel_id": "channel-demo"
        },
        "raw_event": {
          "event": "message",
          "author": "viewer-17",
          "body": ""
        },
        "validation": {
          "status": "invalid",
          "reason_codes": [
            "missing_text"
          ]
        }
      }
    },
    {
      "name": "chat-event.example.json",
      "schema": "chat-event.schema.json",
      "value": {
        "schema_version": "ssr.chat-event.v1",
        "ingest_id": "ing-2026-0002",
        "message_id": "msg-2026-0002",
        "occurred_at": "2026-10-17T09:31:00Z",
        "conversation_id": "conv-demo-1",
        "source": {
          "platform": "example-chat",
          "channel_id": "channel-demo"
        },
        "actor": {
          "actor_id": "viewer-17",
          "display_name": "範例觀眾",
          "role": "viewer"
        },
        "text": "灰燼狐的進化道具在哪裡取得？另外東京現在會下雨嗎？"
      }
    },
    {
      "name": "routing-decision.example.json",
      "schema": "routing-decision.schema.json",
      "value": {
        "schema_version": "ssr.routing-decision.v1",
        "ingest_id": "ing-2026-0003",
        "message_id": "msg-2026-0003",
        "disposition": "not_triggered",
        "next_step": "fixed_sop",
        "reason_codes": [
          "no_question_or_wake_signal"
        ]
      }
    },
    {
      "name": "context-snapshot.example.json",
      "schema": "context-snapshot.schema.json",
      "value": {
        "schema_version": "ssr.context-snapshot.v1",
        "snapshot_id": "ctx-2026-0042",
        "conversation_id": "conv-demo-1",
        "source": "ssr-conversation-store",
        "generated_at": "2026-10-17T09:31:01Z",
        "messages": [
          {
            "message_id": "msg-2026-0040",
            "occurred_at": "2026-10-17T09:29:00Z",
            "role": "viewer",
            "text": "我最近開始玩灰燼旅人。"
          },
          {
            "message_id": "msg-2026-0041",
            "occurred_at": "2026-10-17T09:29:30Z",
            "role": "streamer",
            "text": "這個角色可以在霧港附近找到。"
          }
        ]
      }
    },
    {
      "name": "question-analysis.example.json",
      "schema": "question-analysis.schema.json",
      "value": {
        "schema_version": "ssr.question-analysis.v1",
        "analysis_id": "analysis-2026-0002",
        "run_id": "run-2026-0002",
        "message_id": "msg-2026-0002",
        "context_snapshot_id": "ctx-2026-0042",
        "questions": [
          {
            "question_id": "q-1",
            "query_type": "game_item",
            "question_text": "灰燼狐的進化道具在哪裡取得？"
          },
          {
            "question_id": "q-2",
            "query_type": "weather",
            "question_text": "東京現在會下雨嗎？"
          }
        ]
      }
    },
    {
      "name": "query-request.weather.example.json",
      "schema": "query-request.schema.json",
      "value": {
        "schema_version": "ssr.query-request.v1",
        "query_id": "query-weather-0001",
        "run_id": "run-queries-0001",
        "message_id": "msg-queries-0001",
        "question_id": "q-weather",
        "query_type": "weather",
        "query_text": "東京現在會下雨嗎？"
      }
    },
    {
      "name": "query-request.person.example.json",
      "schema": "query-request.schema.json",
      "value": {
        "schema_version": "ssr.query-request.v1",
        "query_id": "query-person-0001",
        "run_id": "run-queries-0001",
        "message_id": "msg-queries-0001",
        "question_id": "q-person",
        "query_type": "person",
        "query_text": "請介紹範例人物 A。"
      }
    },
    {
      "name": "query-request.game-info.example.json",
      "schema": "query-request.schema.json",
      "value": {
        "schema_version": "ssr.query-request.v1",
        "query_id": "query-game-info-0001",
        "run_id": "run-queries-0001",
        "message_id": "msg-queries-0001",
        "question_id": "q-game-info",
        "query_type": "game_info",
        "query_text": "這款遊戲的世界觀是什麼？"
      }
    },
    {
      "name": "query-request.game-guide.example.json",
      "schema": "query-request.schema.json",
      "value": {
        "schema_version": "ssr.query-request.v1",
        "query_id": "query-game-guide-0001",
        "run_id": "run-queries-0001",
        "message_id": "msg-queries-0001",
        "question_id": "q-game-guide",
        "query_type": "game_guide",
        "query_text": "範例關卡該如何通關？"
      }
    },
    {
      "name": "query-request.game-item.example.json",
      "schema": "query-request.schema.json",
      "value": {
        "schema_version": "ssr.query-request.v1",
        "query_id": "query-game-item-0001",
        "run_id": "run-queries-0001",
        "message_id": "msg-queries-0001",
        "question_id": "q-game-item",
        "query_type": "game_item",
        "query_text": "範例道具在哪裡取得？"
      }
    },
    {
      "name": "query-result.example.json",
      "schema": "query-result.schema.json",
      "value": {
        "schema_version": "ssr.query-result.v1",
        "query_id": "query-2026-0002",
        "run_id": "run-2026-0002",
        "message_id": "msg-2026-0002",
        "question_id": "q-1",
        "query_type": "game_item",
        "status": "ok",
        "materials": [
          {
            "material_id": "mat-demo-1",
            "title": "灰燼狐進化道具",
            "content": "範例資料：於霧港的巡守商人處兌換。",
            "source_ids": [
              "src-demo-1"
            ],
            "knowledge_version": "knowledge-demo-1"
          }
        ],
        "sources": [
          {
            "source_id": "src-demo-1",
            "source_type": "wiki",
            "locator": "wiki://items/ash-fox-evolution",
            "observed_at": "2026-10-17T09:30:00Z"
          }
        ]
      }
    },
    {
      "name": "query-result.weather.example.json",
      "schema": "query-result.schema.json",
      "value": {
        "schema_version": "ssr.query-result.v1",
        "query_id": "query-2026-0003",
        "run_id": "run-2026-0002",
        "message_id": "msg-2026-0002",
        "question_id": "q-2",
        "query_type": "weather",
        "status": "unavailable",
        "materials": [],
        "sources": []
      }
    },
    {
      "name": "answer-prompt-input.example.json",
      "schema": "answer-prompt-input.schema.json",
      "value": {
        "schema_version": "ssr.answer-prompt-input.v1",
        "run_id": "run-2026-0002",
        "message_id": "msg-2026-0002",
        "context_snapshot": {
          "schema_version": "ssr.context-snapshot.v1",
          "snapshot_id": "ctx-2026-0042",
          "conversation_id": "conv-demo-1",
          "source": "ssr-conversation-store",
          "generated_at": "2026-10-17T09:31:01Z",
          "messages": [
            {
              "message_id": "msg-2026-0040",
              "occurred_at": "2026-10-17T09:29:00Z",
              "role": "viewer",
              "text": "我最近開始玩灰燼旅人。"
            },
            {
              "message_id": "msg-2026-0041",
              "occurred_at": "2026-10-17T09:29:30Z",
              "role": "streamer",
              "text": "這個角色可以在霧港附近找到。"
            }
          ]
        },
        "analysis": {
          "schema_version": "ssr.question-analysis.v1",
          "analysis_id": "analysis-2026-0002",
          "run_id": "run-2026-0002",
          "message_id": "msg-2026-0002",
          "context_snapshot_id": "ctx-2026-0042",
          "questions": [
            {
              "question_id": "q-1",
              "query_type": "game_item",
              "question_text": "灰燼狐的進化道具在哪裡取得？"
            },
            {
              "question_id": "q-2",
              "query_type": "weather",
              "question_text": "東京現在會下雨嗎？"
            }
          ]
        },
        "query_results": [
          {
            "schema_version": "ssr.query-result.v1",
            "query_id": "query-2026-0002",
            "run_id": "run-2026-0002",
            "message_id": "msg-2026-0002",
            "question_id": "q-1",
            "query_type": "game_item",
            "status": "ok",
            "materials": [
              {
                "material_id": "mat-demo-1",
                "title": "灰燼狐進化道具",
                "content": "範例資料：於霧港的巡守商人處兌換。",
                "source_ids": [
                  "src-demo-1"
                ],
                "knowledge_version": "knowledge-demo-1"
              }
            ],
            "sources": [
              {
                "source_id": "src-demo-1",
                "source_type": "wiki",
                "locator": "wiki://items/ash-fox-evolution",
                "observed_at": "2026-10-17T09:30:00Z"
              }
            ]
          },
          {
            "schema_version": "ssr.query-result.v1",
            "query_id": "query-2026-0003",
            "run_id": "run-2026-0002",
            "message_id": "msg-2026-0002",
            "question_id": "q-2",
            "query_type": "weather",
            "status": "unavailable",
            "materials": [],
            "sources": []
          }
        ]
      }
    },
    {
      "name": "answer-run-record.example.json",
      "schema": "answer-run-record.schema.json",
      "value": {
        "schema_version": "ssr.answer-run-record.v1",
        "run_id": "run-2026-0002",
        "message_id": "msg-2026-0002",
        "started_at": "2026-10-17T09:31:01Z",
        "completed_at": "2026-10-17T09:31:04Z",
        "status": "completed",
        "context_snapshot_id": "ctx-2026-0042",
        "query_executions": [
          {
            "query_id": "query-2026-0002",
            "query_type": "game_item",
            "status": "ok"
          },
          {
            "query_id": "query-2026-0003",
            "query_type": "weather",
            "status": "unavailable"
          }
        ],
        "gap_record_ids": [
          "gap-2026-0001"
        ]
      }
    }
  ],
  "functionalCases": [
    {
      "id": "F01",
      "title": "內建範例與 CLI 一致",
      "input": "14 份合成範例、9 份 schema",
      "expected": "共用核心 14/14 通過，沒有遺漏範例或 schema。"
    },
    {
      "id": "F02",
      "title": "欄位與格式拒絕",
      "input": "缺欄位、錯型別／enum、額外欄位、無時區時間",
      "expected": "失敗結果帶 JSON 路徑，不拋未處理例外。"
    },
    {
      "id": "F03",
      "title": "輸入驗證狀態關聯",
      "input": "valid/invalid、normalized_event、ingest_id",
      "expected": "接受正確關聯；合法 invalid 記錄可符合契約。"
    },
    {
      "id": "F04",
      "title": "路由語意",
      "input": "三種 disposition 及 next_step/message_id",
      "expected": "正確到 fixed_sop 或 question_analysis，拒絕錯誤組合。"
    },
    {
      "id": "F05",
      "title": "快照與來源一致",
      "input": "snapshot/run/message 關聯及素材 source_ids",
      "expected": "拒絕錯配快照、執行 ID 與不存在的來源。"
    },
    {
      "id": "F06",
      "title": "不合法與過量輸入",
      "input": "空白、非法 JSON、未知 schema、超過 256 KiB/64 層/20,000 節點",
      "expected": "明確解析或限制錯誤，舊成功狀態失效。"
    },
    {
      "id": "F07",
      "title": "編輯與重複操作",
      "input": "載入、編輯、重複提交、清除／復原、返回",
      "expected": "實際輸入對應結果；改動即過期；返回不丟失資料。"
    },
    {
      "id": "F08",
      "title": "批次與取消",
      "input": "全部範例、中途取消與再次執行",
      "expected": "只呈現實際完成數，取消不宣稱全部通過。"
    },
    {
      "id": "F09",
      "title": "離線與可操作性",
      "input": "檔案開啟、桌面／窄視窗、鍵盤焦點",
      "expected": "無外部依賴、控制項有標籤、焦點可見；未做的 UI 檢查明列。"
    },
    {
      "id": "F10",
      "title": "同版證據與隔離",
      "input": "來源指紋、bundle、Node/UI 紀錄",
      "expected": "證據有精確版本與輸出，不含真實資料或完整本機環境。"
    },
    {
      "id": "F11",
      "title": "可串接的 CLI 與 Node 接口",
      "input": "stdin／一般檔案的合成 UTF-8 JSON、明確 schema、合法與不合法案例",
      "expected": "同次輸入取得固定 JSON 收據及明確 exit code；日期不被正規化、重送無寫入副作用，不替代瀏覽器驗收。"
    }
  ],
  "commonAcceptance": {
    "status": "defined",
    "overallResult": "blocked",
    "appliesTo": "all_repositories",
    "details": {
      "criterion": "網頁必須能在使用者的預設瀏覽器實際開啟並可操作、運作正常。",
      "requiredEvidence": "實際在預設瀏覽器看到頁面，操作本 repo 適用的輸入、輸出和錯誤流程，留下真實操作證據與結果；程式存在、HTTP 成功或模擬 DOM／後端測試均不能替代。"
    },
    "message": "所有 repo 的共通門檻都是預設瀏覽器實際開啟並正常操作。本頁實際瀏覽器驗收受阻，尚未通過；功能測試不能替代。",
    "functionalCasesReplaceCommonStandard": false,
    "verification": {
      "defaultBrowser": "not_verified",
      "actualPageOpen": "not_run",
      "functionalInteraction": "not_run",
      "evidence": [
        "docs/acceptance/ui.json"
      ],
      "reason": "先前必要的 file: 導覽在載入前遭瀏覽器政策拒絕，且不得重試或換路徑繞過；沒有真實瀏覽器畫面與操作證據。",
      "priorDenialNotRetried": true
    },
    "applicability": [
      {
        "topic": "預設瀏覽器可開啟運作的共通門檻",
        "status": "applicable",
        "reason": "使用者明訂所有 repo 採同一門檻，本 repo 不能豁免或以其他測試替代。",
        "evidence": [
          "docs/ACCEPTANCE.md"
        ]
      },
      {
        "topic": "目前靜態網頁的後端服務啟停操作",
        "status": "not_applicable",
        "reason": "目前頁面只載入本 repo 靜態資源與瀏覽器內驗證核心，沒有後端服務可啟停；此理由僅描述現有功能，不構成共用標準豁免。",
        "evidence": [
          "web/index.html",
          "web/app.js",
          "tools/contract-validator.js"
        ]
      }
    ]
  },
  "source": {
    "fingerprint": "a1e33fb66e699de31b7b7aef856b5f813fd9abbb553dfbc2b0437e39684c1194",
    "files": {
      "README.md": "2e4498e56114c8c8ec6c5db1a87d639834ba91586e5e53908d268853d2d628b0",
      "contracts/v0.1/answer-prompt-input.schema.json": "426cfb2b023153dd22fea916b7a85626c8ebd0df16f5d5e22197c28fd978d7ce",
      "contracts/v0.1/answer-run-record.schema.json": "a619180c46981e3b312ea0a11a9d038cea8fab4fc94658f9af6c437a462cd940",
      "contracts/v0.1/chat-event.schema.json": "2d710a75a1baaf618b782e9ef394442b9a8d57328f1733693dc64f87166466c3",
      "contracts/v0.1/context-snapshot.schema.json": "eb84c2bf2bb077a671a1f6b0ad66ebb6700210c1153ba45a7f0a8670741bd84a",
      "contracts/v0.1/ingest-attempt.schema.json": "2aeb77ff8e5c02362d96a38439b5831f63439307f2ccb28c74bd365a8233e741",
      "contracts/v0.1/query-request.schema.json": "27574369eb6dfa4c6edc3a79e3b0bf844a1ad8fc6426f128af89a7ca9af4a47a",
      "contracts/v0.1/query-result.schema.json": "e3aebba2aea237e1b5d5afd25118b529c660bac8645e6fc3c83980767aa4f021",
      "contracts/v0.1/question-analysis.schema.json": "f30200b7db71889c3fcd4052e96223984f9bfa0d2a624d2e6be5fe95723f6627",
      "contracts/v0.1/routing-decision.schema.json": "37cc31d0453c561b25a67581e5b1dca6969795eaa56e73f2260757ba41bd4a7c",
      "docs/ACCEPTANCE.md": "515cb00544cf11324a494ad66748794a09d51dbbf41729180eb8f7d2332f674d",
      "docs/INTERFACES.md": "c2d9cc19bdbd71e2b4a0cc7b16c9b892a59d5cf3787a7af56a040f0742f3f7b5",
      "docs/common-acceptance-status.json": "f0392e412c86ea8558c77646fd9672837e3fd486d06deb3093b406e7182168e4",
      "docs/functional-cases.json": "dc18ad736e3aaa2c5d23bfae8e6b70142797d7b85e673ac83d79b1c77ff7841e",
      "examples/answer-prompt-input.example.json": "4c7fdb2350172bd2ee6ceebdb3c102a718408270cdeeb948de235c99bcff26fc",
      "examples/answer-run-record.example.json": "e6696f9efa572876087ec631dbc67add5252ca566cbad2441801f955bc8640a9",
      "examples/chat-event.example.json": "d3f3f9a432dd2efe0beb9288358ab63575798c9a236fc0d0582eb9e604b173a2",
      "examples/context-snapshot.example.json": "11d5ed5f71cb5bd9822d322a1e08607d13e4e6ce1164f4f2da7d4271f3200e94",
      "examples/ingest-attempt.example.json": "92bd0593e00cb2ef970c68bfd4c13e969f344c60cc481b08c1b3ac47740e0204",
      "examples/query-request.game-guide.example.json": "cf47f7040289b1da02de8c837302319d894e4b1c9649ccb9900accadaeb62855",
      "examples/query-request.game-info.example.json": "6e39b6788c4cd4d1cddd519c3b63d44fbffdff52430069581eda4df1257cde86",
      "examples/query-request.game-item.example.json": "f4fe149782a13605804cd235d7a33b484e588c79148d6bc56a974f21db11b68b",
      "examples/query-request.person.example.json": "5ac8c00f6e6cdbba164c91dad43bb1d391889263fc5fe968974300d427251495",
      "examples/query-request.weather.example.json": "fcde8519c6800a80597b1bdbe3dc87a64c019c1f78b4d938fe90a4bd5c4397cf",
      "examples/query-result.example.json": "c8b005d20245d01f83fdda25dd8d99d14fed976d343aac7b32127f6914fc4aec",
      "examples/query-result.weather.example.json": "6eb0d32785c244f84a91d4da3601f3905bf1fcb1e8d7a6c28f26d066148b8d3a",
      "examples/question-analysis.example.json": "61ceb11d333a1b3a36d449134ddbbb5c8ffa1f207e5375f1d89fab1882e72be4",
      "examples/routing-decision.example.json": "10fafae67f5f375b10c8bf9596254f45eba6255b4aefdfd4fe946d3461a845a8",
      "interfaces/audit.json": "bce3905337d14f42dba4cdc8118fc46b898a48c77bfdfa44a85a486ebff73968",
      "interfaces/validation-cases.json": "1bc65888e86a88f2246a71135028aa91ae3bfa5470bb7c4c076b81554d6d8883",
      "interfaces/validation-result.schema.json": "4005bc625f05d750e4f27a9bf60fe7bd7ba52067510c4d223287136d56075a35",
      "tests/contract-validator.test.mjs": "d20b2bb38148261c74fd5f8c2aaffe0dcd2463caa1a48aa68e64b3edf06ecda2",
      "tests/interfaces.test.mjs": "7119cf582a12f4e4378d5e7a8c7bca9812f08aa2309ac5271c84bd25f3fbf88d",
      "tests/workbench.test.mjs": "0f299b973f7f10a2922cb2b91bc9e0f35e9309d72d239ef8cd1ab73607910806",
      "tools/build_workbench.mjs": "ef56299ad6d2af2265fdde06fd7a9cc0cac931453ddff528f9320a1473fb4466",
      "tools/contract-validator.js": "cce267604c2601dfba491d57f4f4e18a8f7f2f40a0890ea1cbedcca34ee8457a",
      "tools/contracts-api.mjs": "c4fbc7a22821c82303baf873d88d0611d22652b30b95707c59815da82f026d98",
      "tools/record_acceptance.mjs": "98f77c02484dc7246228a8bb224819766c1c6d806a5447857cb0c66730155113",
      "tools/validate_contract.mjs": "7a9194017112e06dd877f16ec62e22f2c2ea8ecb86b7b0b5f1af05d859997f94",
      "tools/validate_examples.mjs": "f20d5d54764c09c5f1669fef182a050ab0111b4aa989f3bdb9c868132bdaa319",
      "tools/workbench-data.mjs": "a85a365fc1d3d08d498aee80af22384c337d7ef5148ca9ca2cc3c5e83cf28775",
      "web/app.js": "8f552ca1c8e77d56d998798651cb8628474fa1dc06b243bd394427fd10858b29",
      "web/index.html": "8035122aae04ea8c2d909e3e5071c226245b180f693e7f39eabff46641eb6bb5",
      "web/styles.css": "7e022fb5d71474a6e6e52495ef8a75edc51a6e00a19450f7982ac079e192b995"
    }
  },
  "evidence": {
    "id": "data-contracts-local-2026-11-05T20:56:33.707Z",
    "startedAt": "2026-11-05T20:56:33.707Z",
    "finishedAt": "2026-11-05T20:56:36.174Z",
    "status": "functional_tests_pass",
    "scope": "本 repo 功能測例；只使用合成資料，不代表共用驗收或真實瀏覽器通過。",
    "commonAcceptance": {
      "status": "defined",
      "overallResult": "blocked",
      "appliesTo": "all_repositories",
      "details": {
        "criterion": "網頁必須能在使用者的預設瀏覽器實際開啟並可操作、運作正常。",
        "requiredEvidence": "實際在預設瀏覽器看到頁面，操作本 repo 適用的輸入、輸出和錯誤流程，留下真實操作證據與結果；程式存在、HTTP 成功或模擬 DOM／後端測試均不能替代。"
      },
      "message": "所有 repo 的共通門檻都是預設瀏覽器實際開啟並正常操作。本頁實際瀏覽器驗收受阻，尚未通過；功能測試不能替代。",
      "functionalCasesReplaceCommonStandard": false,
      "verification": {
        "defaultBrowser": "not_verified",
        "actualPageOpen": "not_run",
        "functionalInteraction": "not_run",
        "evidence": [
          "docs/acceptance/ui.json"
        ],
        "reason": "先前必要的 file: 導覽在載入前遭瀏覽器政策拒絕，且不得重試或換路徑繞過；沒有真實瀏覽器畫面與操作證據。",
        "priorDenialNotRetried": true
      },
      "applicability": [
        {
          "topic": "預設瀏覽器可開啟運作的共通門檻",
          "status": "applicable",
          "reason": "使用者明訂所有 repo 採同一門檻，本 repo 不能豁免或以其他測試替代。",
          "evidence": [
            "docs/ACCEPTANCE.md"
          ]
        },
        {
          "topic": "目前靜態網頁的後端服務啟停操作",
          "status": "not_applicable",
          "reason": "目前頁面只載入本 repo 靜態資源與瀏覽器內驗證核心，沒有後端服務可啟停；此理由僅描述現有功能，不構成共用標準豁免。",
          "evidence": [
            "web/index.html",
            "web/app.js",
            "tools/contract-validator.js"
          ]
        }
      ]
    },
    "version": {
      "head": "c3bafc6432e1eed68b3d088f8bba558f04ca115b",
      "branch": "main",
      "dirty": [
        " M README.md",
        " M tools/validate_examples.mjs",
        "?? docs/ACCEPTANCE.md",
        "?? docs/INTERFACES.md",
        "?? docs/acceptance/latest.json",
        "?? docs/acceptance/pre-fix-datetime.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T18_33_14.705Z.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T18_35_35.506Z.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T18_36_26.988Z.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T18_43_54.333Z.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T18_53_39.834Z.json",
        "?? docs/acceptance/runs/data-contracts-local-2026-11-05T20_54_40.011Z.json",
        "?? docs/acceptance/ui.json",
        "?? docs/common-acceptance-status.json",
        "?? docs/functional-cases.json",
        "?? interfaces/audit.json",
        "?? interfaces/validation-cases.json",
        "?? interfaces/validation-result.schema.json",
        "?? tests/contract-validator.test.mjs",
        "?? tests/interfaces.test.mjs",
        "?? tests/workbench.test.mjs",
        "?? tools/build_workbench.mjs",
        "?? tools/contract-validator.js",
        "?? tools/contracts-api.mjs",
        "?? tools/record_acceptance.mjs",
        "?? tools/validate_contract.mjs",
        "?? tools/workbench-data.mjs",
        "?? web/app.js",
        "?? web/data.js",
        "?? web/index.html",
        "?? web/styles.css"
      ]
    },
    "sourceUnchangedDuringTests": true,
    "source": {
      "fingerprint": "a1e33fb66e699de31b7b7aef856b5f813fd9abbb553dfbc2b0437e39684c1194",
      "files": {
        "README.md": "2e4498e56114c8c8ec6c5db1a87d639834ba91586e5e53908d268853d2d628b0",
        "contracts/v0.1/answer-prompt-input.schema.json": "426cfb2b023153dd22fea916b7a85626c8ebd0df16f5d5e22197c28fd978d7ce",
        "contracts/v0.1/answer-run-record.schema.json": "a619180c46981e3b312ea0a11a9d038cea8fab4fc94658f9af6c437a462cd940",
        "contracts/v0.1/chat-event.schema.json": "2d710a75a1baaf618b782e9ef394442b9a8d57328f1733693dc64f87166466c3",
        "contracts/v0.1/context-snapshot.schema.json": "eb84c2bf2bb077a671a1f6b0ad66ebb6700210c1153ba45a7f0a8670741bd84a",
        "contracts/v0.1/ingest-attempt.schema.json": "2aeb77ff8e5c02362d96a38439b5831f63439307f2ccb28c74bd365a8233e741",
        "contracts/v0.1/query-request.schema.json": "27574369eb6dfa4c6edc3a79e3b0bf844a1ad8fc6426f128af89a7ca9af4a47a",
        "contracts/v0.1/query-result.schema.json": "e3aebba2aea237e1b5d5afd25118b529c660bac8645e6fc3c83980767aa4f021",
        "contracts/v0.1/question-analysis.schema.json": "f30200b7db71889c3fcd4052e96223984f9bfa0d2a624d2e6be5fe95723f6627",
        "contracts/v0.1/routing-decision.schema.json": "37cc31d0453c561b25a67581e5b1dca6969795eaa56e73f2260757ba41bd4a7c",
        "docs/ACCEPTANCE.md": "515cb00544cf11324a494ad66748794a09d51dbbf41729180eb8f7d2332f674d",
        "docs/INTERFACES.md": "c2d9cc19bdbd71e2b4a0cc7b16c9b892a59d5cf3787a7af56a040f0742f3f7b5",
        "docs/common-acceptance-status.json": "f0392e412c86ea8558c77646fd9672837e3fd486d06deb3093b406e7182168e4",
        "docs/functional-cases.json": "dc18ad736e3aaa2c5d23bfae8e6b70142797d7b85e673ac83d79b1c77ff7841e",
        "examples/answer-prompt-input.example.json": "4c7fdb2350172bd2ee6ceebdb3c102a718408270cdeeb948de235c99bcff26fc",
        "examples/answer-run-record.example.json": "e6696f9efa572876087ec631dbc67add5252ca566cbad2441801f955bc8640a9",
        "examples/chat-event.example.json": "d3f3f9a432dd2efe0beb9288358ab63575798c9a236fc0d0582eb9e604b173a2",
        "examples/context-snapshot.example.json": "11d5ed5f71cb5bd9822d322a1e08607d13e4e6ce1164f4f2da7d4271f3200e94",
        "examples/ingest-attempt.example.json": "92bd0593e00cb2ef970c68bfd4c13e969f344c60cc481b08c1b3ac47740e0204",
        "examples/query-request.game-guide.example.json": "cf47f7040289b1da02de8c837302319d894e4b1c9649ccb9900accadaeb62855",
        "examples/query-request.game-info.example.json": "6e39b6788c4cd4d1cddd519c3b63d44fbffdff52430069581eda4df1257cde86",
        "examples/query-request.game-item.example.json": "f4fe149782a13605804cd235d7a33b484e588c79148d6bc56a974f21db11b68b",
        "examples/query-request.person.example.json": "5ac8c00f6e6cdbba164c91dad43bb1d391889263fc5fe968974300d427251495",
        "examples/query-request.weather.example.json": "fcde8519c6800a80597b1bdbe3dc87a64c019c1f78b4d938fe90a4bd5c4397cf",
        "examples/query-result.example.json": "c8b005d20245d01f83fdda25dd8d99d14fed976d343aac7b32127f6914fc4aec",
        "examples/query-result.weather.example.json": "6eb0d32785c244f84a91d4da3601f3905bf1fcb1e8d7a6c28f26d066148b8d3a",
        "examples/question-analysis.example.json": "61ceb11d333a1b3a36d449134ddbbb5c8ffa1f207e5375f1d89fab1882e72be4",
        "examples/routing-decision.example.json": "10fafae67f5f375b10c8bf9596254f45eba6255b4aefdfd4fe946d3461a845a8",
        "interfaces/audit.json": "bce3905337d14f42dba4cdc8118fc46b898a48c77bfdfa44a85a486ebff73968",
        "interfaces/validation-cases.json": "1bc65888e86a88f2246a71135028aa91ae3bfa5470bb7c4c076b81554d6d8883",
        "interfaces/validation-result.schema.json": "4005bc625f05d750e4f27a9bf60fe7bd7ba52067510c4d223287136d56075a35",
        "tests/contract-validator.test.mjs": "d20b2bb38148261c74fd5f8c2aaffe0dcd2463caa1a48aa68e64b3edf06ecda2",
        "tests/interfaces.test.mjs": "7119cf582a12f4e4378d5e7a8c7bca9812f08aa2309ac5271c84bd25f3fbf88d",
        "tests/workbench.test.mjs": "0f299b973f7f10a2922cb2b91bc9e0f35e9309d72d239ef8cd1ab73607910806",
        "tools/build_workbench.mjs": "ef56299ad6d2af2265fdde06fd7a9cc0cac931453ddff528f9320a1473fb4466",
        "tools/contract-validator.js": "cce267604c2601dfba491d57f4f4e18a8f7f2f40a0890ea1cbedcca34ee8457a",
        "tools/contracts-api.mjs": "c4fbc7a22821c82303baf873d88d0611d22652b30b95707c59815da82f026d98",
        "tools/record_acceptance.mjs": "98f77c02484dc7246228a8bb224819766c1c6d806a5447857cb0c66730155113",
        "tools/validate_contract.mjs": "7a9194017112e06dd877f16ec62e22f2c2ea8ecb86b7b0b5f1af05d859997f94",
        "tools/validate_examples.mjs": "f20d5d54764c09c5f1669fef182a050ab0111b4aa989f3bdb9c868132bdaa319",
        "tools/workbench-data.mjs": "a85a365fc1d3d08d498aee80af22384c337d7ef5148ca9ca2cc3c5e83cf28775",
        "web/app.js": "8f552ca1c8e77d56d998798651cb8628474fa1dc06b243bd394427fd10858b29",
        "web/index.html": "8035122aae04ea8c2d909e3e5071c226245b180f693e7f39eabff46641eb6bb5",
        "web/styles.css": "7e022fb5d71474a6e6e52495ef8a75edc51a6e00a19450f7982ac079e192b995"
      }
    },
    "runtime": {
      "node": "v24.13.0",
      "preloadAndCoverage": "disabled",
      "compileCache": "disabled"
    },
    "inputs": [
      {
        "example": "examples/ingest-attempt.example.json",
        "schema": "contracts/v0.1/ingest-attempt.schema.json"
      },
      {
        "example": "examples/chat-event.example.json",
        "schema": "contracts/v0.1/chat-event.schema.json"
      },
      {
        "example": "examples/routing-decision.example.json",
        "schema": "contracts/v0.1/routing-decision.schema.json"
      },
      {
        "example": "examples/context-snapshot.example.json",
        "schema": "contracts/v0.1/context-snapshot.schema.json"
      },
      {
        "example": "examples/question-analysis.example.json",
        "schema": "contracts/v0.1/question-analysis.schema.json"
      },
      {
        "example": "examples/query-request.weather.example.json",
        "schema": "contracts/v0.1/query-request.schema.json"
      },
      {
        "example": "examples/query-request.person.example.json",
        "schema": "contracts/v0.1/query-request.schema.json"
      },
      {
        "example": "examples/query-request.game-info.example.json",
        "schema": "contracts/v0.1/query-request.schema.json"
      },
      {
        "example": "examples/query-request.game-guide.example.json",
        "schema": "contracts/v0.1/query-request.schema.json"
      },
      {
        "example": "examples/query-request.game-item.example.json",
        "schema": "contracts/v0.1/query-request.schema.json"
      },
      {
        "example": "examples/query-result.example.json",
        "schema": "contracts/v0.1/query-result.schema.json"
      },
      {
        "example": "examples/query-result.weather.example.json",
        "schema": "contracts/v0.1/query-result.schema.json"
      },
      {
        "example": "examples/answer-prompt-input.example.json",
        "schema": "contracts/v0.1/answer-prompt-input.schema.json"
      },
      {
        "example": "examples/answer-run-record.example.json",
        "schema": "contracts/v0.1/answer-run-record.schema.json"
      }
    ],
    "syntheticBoundaryCases": "tests/contract-validator.test.mjs；UI 狀態：tests/workbench.test.mjs；真實 CLI/library：tests/interfaces.test.mjs",
    "interfaceCases": "interfaces/validation-cases.json",
    "interfaceResultSchema": "interfaces/validation-result.schema.json",
    "priorFailureEvidence": "docs/acceptance/pre-fix-datetime.json",
    "runs": [
      {
        "executable": "node",
        "args": [
          "tools/validate_examples.mjs"
        ],
        "startedAt": "2026-11-05T20:56:33.708Z",
        "finishedAt": "2026-11-05T20:56:33.790Z",
        "expectedExit": 0,
        "caseId": null,
        "syntheticInput": null,
        "actualResult": null,
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "OK  ingest-attempt.example.json -> ingest-attempt.schema.json\nOK  chat-event.example.json -> chat-event.schema.json\nOK  routing-decision.example.json -> routing-decision.schema.json\nOK  context-snapshot.example.json -> context-snapshot.schema.json\nOK  question-analysis.example.json -> question-analysis.schema.json\nOK  query-request.weather.example.json -> query-request.schema.json\nOK  query-request.person.example.json -> query-request.schema.json\nOK  query-request.game-info.example.json -> query-request.schema.json\nOK  query-request.game-guide.example.json -> query-request.schema.json\nOK  query-request.game-item.example.json -> query-request.schema.json\nOK  query-result.example.json -> query-result.schema.json\nOK  query-result.weather.example.json -> query-result.schema.json\nOK  answer-prompt-input.example.json -> answer-prompt-input.schema.json\nOK  answer-run-record.example.json -> answer-run-record.schema.json\n\n通過：14 組範例與目前檢查器支援的 schema 子集一致。\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "--test",
          "tests/contract-validator.test.mjs",
          "tests/workbench.test.mjs",
          "tests/interfaces.test.mjs"
        ],
        "startedAt": "2026-11-05T20:56:33.790Z",
        "finishedAt": "2026-11-05T20:56:35.412Z",
        "expectedExit": 0,
        "caseId": null,
        "syntheticInput": null,
        "actualResult": null,
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "✔ F01 accepted synthetic fixture: ingest-attempt.example.json (2.6977ms)\n✔ F01 accepted synthetic fixture: chat-event.example.json (0.7634ms)\n✔ F01 accepted synthetic fixture: routing-decision.example.json (0.6161ms)\n✔ F01 accepted synthetic fixture: context-snapshot.example.json (0.6386ms)\n✔ F01 accepted synthetic fixture: question-analysis.example.json (0.6436ms)\n✔ F01 accepted synthetic fixture: query-request.weather.example.json (0.5839ms)\n✔ F01 accepted synthetic fixture: query-request.person.example.json (0.5403ms)\n✔ F01 accepted synthetic fixture: query-request.game-info.example.json (0.624ms)\n✔ F01 accepted synthetic fixture: query-request.game-guide.example.json (0.6341ms)\n✔ F01 accepted synthetic fixture: query-request.game-item.example.json (0.7846ms)\n✔ F01 accepted synthetic fixture: query-result.example.json (0.7364ms)\n✔ F01 accepted synthetic fixture: query-result.weather.example.json (0.5062ms)\n✔ F01 accepted synthetic fixture: answer-prompt-input.example.json (0.7046ms)\n✔ F01 accepted synthetic fixture: answer-run-record.example.json (0.584ms)\n✔ F02 rejects missing field (0.669ms)\n✔ F02 rejects wrong type (0.6427ms)\n✔ F02 rejects unknown property (0.672ms)\n✔ F02 rejects unknown enum (0.6783ms)\n✔ F02 rejects wrong version (0.6184ms)\n✔ F02 rejects empty text (0.6831ms)\n✔ F02 rejects missing timezone (0.5674ms)\n✔ F02 rejects invalid date (0.6431ms)\n✔ F02 rejects null nested value (0.8385ms)\n✔ F02 rejects invalid array item (0.5899ms)\n✔ F03 valid ingest requires normalized event and matching ingest_id (1.2267ms)\n✔ F03 invalid ingest cannot carry normalized event (1.0523ms)\n✔ F04 routing invalid positive and negative combinations (0.7367ms)\n✔ F04 routing not_triggered positive and negative combinations (0.6035ms)\n✔ F04 routing triggered positive and negative combinations (0.6428ms)\n✔ F04 valid routing needs message_id but invalid routing may omit it (0.5771ms)\n✔ F05 rejects mismatched snapshot (0.8784ms)\n✔ F05 rejects mismatched analysis run (0.7416ms)\n✔ F05 rejects mismatched analysis message (0.699ms)\n✔ F05 rejects mismatched query run (0.6299ms)\n✔ F05 rejects mismatched query message (0.6951ms)\n✔ F05 rejects dangling source reference including nested prompt results (1.6382ms)\n✔ F05 unavailable weather must not claim material or source (1.1547ms)\n✔ F06 empty, malformed JSON, null and unknown schema fail safely (0.1506ms)\n✔ F06 input limit counts UTF-8 bytes (0.5534ms)\n✔ F06 rejects deeply nested and excessive node input (2.5748ms)\n✔ F06 unknown schema keywords and external references fail closed (0.1339ms)\n✔ F07 repeated validation is deterministic and immutable (1.0686ms)\n✔ interface real CLI receipt: stdin-valid (76.7675ms)\n✔ interface real CLI receipt: file-valid (70.6478ms)\n✔ interface real CLI receipt: required-field-rejection (70.5191ms)\n✔ interface real CLI receipt: empty-input (70.2306ms)\n✔ interface real CLI receipt: invalid-json (68.3741ms)\n✔ interface real CLI receipt: unknown-schema (68.6039ms)\n✔ interface real CLI receipt: valid-repeat (67.4265ms)\n✔ Node library lists nine precise wire versions and freezes canonical schemas (1.7174ms)\n✔ Node library and CLI produce identical packets without mutating synthetic original (70.7123ms)\n✔ repeat submissions produce identical packets with no storage/revision side effect (153.307ms)\n✔ CLI rejects invalid UTF-8 rather than silently replacing original bytes (73.1618ms)\n✔ CLI bounds its input, including multibyte content (67.9299ms)\n✔ CLI reports missing file without exposing the full local environment (70.6469ms)\n✔ CLI returns a real exit-3 receipt for missing contracts in a fresh isolated copy (76.8599ms)\nℹ actual isolated CLI receipt: {\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"\",\"contract_schema_version\":\"\",\"status\":\"error\",\"valid\":false,\"errors\":[\"無法載入契約或完成驗證；請核對本 repo 來源。\"]}\n✔ CLI argument rejection: [] (75.0635ms)\n✔ CLI argument rejection: [\"--schema\"] (72.1132ms)\n✔ CLI argument rejection: [\"--schema\",\"chat-event.schema.json\",\"--unexpected\"] (71.1848ms)\n✔ CLI argument rejection: [\"--schema\",\"chat-event.schema.json\",\"--schema\",\"chat-event.schema.json\"] (76.2794ms)\n✔ CLI argument rejection: [\"--schema\",\"chat-event.schema.json\",\"--stdin\",\"--input\",\"examples/chat-event.example.json\"] (74.8123ms)\n✔ CLI help is read-only and available without a server (74.1497ms)\n✔ empty result and invalid ingest are not confused with malformed contracts (2.2198ms)\n✔ calendar/shape regressions are rejected and valid leap day/timezone preserved (1.0669ms)\n✔ unsupported schema types/formats and null schema fail closed (0.1249ms)\n✔ native Record/ACL fields are not silently added to legacy wire schema (0.7847ms)\n✔ all executable source files participate in the version fingerprint (0.6073ms)\n✔ F01 browser and CLI core accept identical 14 fixtures (40.9528ms)\n✔ F07 loading, validating, editing and errors never reuse old pass (20.613ms)\n✔ F07 duplicate submit, clear and undo are isolated (20.9377ms)\n✔ F07 contract switch invalidates result but preserves input (20.8728ms)\n✔ F07 tabs, keyboard arrows and return preserve draft (20.1925ms)\n✔ F08 batch computes 14 results; duplicate start does not overlap (19.8634ms)\n✔ F08 cancel cannot become pass and later run starts clean (22.0456ms)\n✔ F08 editing during batch invalidates pending callbacks (20.0332ms)\n✔ F09 resources stay local and UI uses no network or persistence API (1.3944ms)\n✔ F10 bundle matches current schema/example/source snapshot (33.3778ms)\n✔ common browser gate stays blocked even when repo functional case passes (20.6108ms)\nℹ tests 78\nℹ suites 0\nℹ pass 78\nℹ fail 0\nℹ cancelled 0\nℹ skipped 0\nℹ todo 0\nℹ duration_ms 1557.8375\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/build_workbench.mjs",
          "--check"
        ],
        "startedAt": "2026-11-05T20:56:35.412Z",
        "finishedAt": "2026-11-05T20:56:35.509Z",
        "expectedExit": 0,
        "caseId": null,
        "syntheticInput": null,
        "actualResult": null,
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "PASS web/data.js 與來源、合成範例及已保存證據一致。\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.509Z",
        "finishedAt": "2026-11-05T20:56:35.583Z",
        "expectedExit": 0,
        "caseId": "stdin-valid",
        "syntheticInput": {
          "mode": "stdin",
          "source": "examples/chat-event.example.json",
          "text": "{\n  \"schema_version\": \"ssr.chat-event.v1\",\n  \"ingest_id\": \"ing-2026-0002\",\n  \"message_id\": \"msg-2026-0002\",\n  \"occurred_at\": \"2026-10-17T09:31:00Z\",\n  \"conversation_id\": \"conv-demo-1\",\n  \"source\": { \"platform\": \"example-chat\", \"channel_id\": \"channel-demo\" },\n  \"actor\": { \"actor_id\": \"viewer-17\", \"display_name\": \"範例觀眾\", \"role\": \"viewer\" },\n  \"text\": \"灰燼狐的進化道具在哪裡取得？另外東京現在會下雨嗎？\"\n}\n"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "valid",
          "valid": true,
          "errors": []
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"valid\",\"valid\":true,\"errors\":[]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--input",
          "examples/chat-event.example.json"
        ],
        "startedAt": "2026-11-05T20:56:35.584Z",
        "finishedAt": "2026-11-05T20:56:35.659Z",
        "expectedExit": 0,
        "caseId": "file-valid",
        "syntheticInput": {
          "mode": "file",
          "source": "examples/chat-event.example.json",
          "text": "{\n  \"schema_version\": \"ssr.chat-event.v1\",\n  \"ingest_id\": \"ing-2026-0002\",\n  \"message_id\": \"msg-2026-0002\",\n  \"occurred_at\": \"2026-10-17T09:31:00Z\",\n  \"conversation_id\": \"conv-demo-1\",\n  \"source\": { \"platform\": \"example-chat\", \"channel_id\": \"channel-demo\" },\n  \"actor\": { \"actor_id\": \"viewer-17\", \"display_name\": \"範例觀眾\", \"role\": \"viewer\" },\n  \"text\": \"灰燼狐的進化道具在哪裡取得？另外東京現在會下雨嗎？\"\n}\n"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "valid",
          "valid": true,
          "errors": []
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"valid\",\"valid\":true,\"errors\":[]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.659Z",
        "finishedAt": "2026-11-05T20:56:35.735Z",
        "expectedExit": 1,
        "caseId": "required-field-rejection",
        "syntheticInput": {
          "mode": "stdin",
          "source": "inline synthetic",
          "text": "{\"schema_version\":\"ssr.chat-event.v1\"}"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "invalid",
          "valid": false,
          "errors": [
            "$: 缺少必填欄位 ingest_id",
            "$: 缺少必填欄位 message_id",
            "$: 缺少必填欄位 occurred_at",
            "$: 缺少必填欄位 conversation_id",
            "$: 缺少必填欄位 source",
            "$: 缺少必填欄位 actor",
            "$: 缺少必填欄位 text"
          ]
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 1,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"invalid\",\"valid\":false,\"errors\":[\"$: 缺少必填欄位 ingest_id\",\"$: 缺少必填欄位 message_id\",\"$: 缺少必填欄位 occurred_at\",\"$: 缺少必填欄位 conversation_id\",\"$: 缺少必填欄位 source\",\"$: 缺少必填欄位 actor\",\"$: 缺少必填欄位 text\"]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.735Z",
        "finishedAt": "2026-11-05T20:56:35.808Z",
        "expectedExit": 2,
        "caseId": "empty-input",
        "syntheticInput": {
          "mode": "stdin",
          "source": "inline synthetic",
          "text": ""
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "input_error",
          "valid": false,
          "errors": [
            "請輸入合成 JSON。"
          ]
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 2,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"input_error\",\"valid\":false,\"errors\":[\"請輸入合成 JSON。\"]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.808Z",
        "finishedAt": "2026-11-05T20:56:35.881Z",
        "expectedExit": 2,
        "caseId": "invalid-json",
        "syntheticInput": {
          "mode": "stdin",
          "source": "inline synthetic",
          "text": "{"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "input_error",
          "valid": false,
          "errors": [
            "JSON 解析失敗。"
          ]
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 2,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"input_error\",\"valid\":false,\"errors\":[\"JSON 解析失敗。\"]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "../not-a-contract.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.881Z",
        "finishedAt": "2026-11-05T20:56:35.952Z",
        "expectedExit": 2,
        "caseId": "unknown-schema",
        "syntheticInput": {
          "mode": "stdin",
          "source": "inline synthetic",
          "text": "{}"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "",
          "contract_schema_version": "",
          "status": "usage_error",
          "valid": false,
          "errors": [
            "請指定本 repo 的 --schema；--stdin 與 --input 不可同時使用。"
          ]
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 2,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"\",\"contract_schema_version\":\"\",\"status\":\"usage_error\",\"valid\":false,\"errors\":[\"請指定本 repo 的 --schema；--stdin 與 --input 不可同時使用。\"]}\n",
        "stderr": "",
        "error": null
      },
      {
        "executable": "node",
        "args": [
          "tools/validate_contract.mjs",
          "--schema",
          "chat-event.schema.json",
          "--stdin"
        ],
        "startedAt": "2026-11-05T20:56:35.953Z",
        "finishedAt": "2026-11-05T20:56:36.023Z",
        "expectedExit": 0,
        "caseId": "valid-repeat",
        "syntheticInput": {
          "mode": "stdin",
          "source": "examples/chat-event.example.json",
          "text": "{\n  \"schema_version\": \"ssr.chat-event.v1\",\n  \"ingest_id\": \"ing-2026-0002\",\n  \"message_id\": \"msg-2026-0002\",\n  \"occurred_at\": \"2026-10-17T09:31:00Z\",\n  \"conversation_id\": \"conv-demo-1\",\n  \"source\": { \"platform\": \"example-chat\", \"channel_id\": \"channel-demo\" },\n  \"actor\": { \"actor_id\": \"viewer-17\", \"display_name\": \"範例觀眾\", \"role\": \"viewer\" },\n  \"text\": \"灰燼狐的進化道具在哪裡取得？另外東京現在會下雨嗎？\"\n}\n"
        },
        "actualResult": {
          "schema_version": "ssr.contract-validation-result.v1",
          "contract_set": "v0.1",
          "schema_name": "chat-event.schema.json",
          "contract_schema_version": "ssr.chat-event.v1",
          "status": "valid",
          "valid": true,
          "errors": []
        },
        "receiptMatches": true,
        "matchesExpectations": true,
        "exitCode": 0,
        "stdout": "{\"schema_version\":\"ssr.contract-validation-result.v1\",\"contract_set\":\"v0.1\",\"schema_name\":\"chat-event.schema.json\",\"contract_schema_version\":\"ssr.chat-event.v1\",\"status\":\"valid\",\"valid\":true,\"errors\":[]}\n",
        "stderr": "",
        "error": null
      }
    ],
    "uiStatus": "瀏覽器實際操作另見 ui.json；沒有該紀錄時為未驗證。",
    "notRun": [
      "完整 Draft 2020-12 meta-schema",
      "完整 RFC 3339",
      "跨 repo adapter／真實平台／來源真實性"
    ]
  },
  "uiEvidence": {
    "status": "blocked",
    "observedAt": "2026-11-05T18:36:26.4939667Z",
    "timestampKind": "記錄拒絕結果的時間，不代表成功開啟頁面",
    "sourceFingerprint": "f6c6db3f0687362e8cfaab917a900b5b58c4e1a98a1c4212b3595af1c042e9ec",
    "attemptedAction": "cua.createBrowserTab",
    "browser": "chrome",
    "target": "web/index.html",
    "requestedProtocol": "file:",
    "outcome": "denied_before_navigation",
    "retried": false,
    "blocker": "Browser URL policy rejected file: protocol; allowed protocols are http: and https:. No authority was granted. The denied operation was stopped; no alternate browser surface, server, port or executor was used.",
    "checks": [
      {
        "name": "本機檔案開啟",
        "status": "denied",
        "actual": "瀏覽器工具在導覽前拒絕 file: URL；沒有成功載入。"
      },
      {
        "name": "實際輸入、輸出、錯誤、重複提交、取消及返回",
        "status": "not_run",
        "actual": "只有 Node DOM 狀態測試通過，未進行真正瀏覽器操作。"
      },
      {
        "name": "桌面／窄視窗與鍵盤",
        "status": "not_run",
        "actual": "政策阻塞，未取得畫面或實際鍵盤操作證據。"
      },
      {
        "name": "使用者預設瀏覽器的呈現與輸入輸出",
        "status": "not_run",
        "actual": "未確認 Chrome 為預設瀏覽器，也沒有成功載入頁面；先前必要的 file: 導覽已拒，依禁止重試限制停止此步驟。"
      }
    ],
    "defaultBrowserStatus": "not_verified",
    "defaultBrowserCheckStatus": "not_run",
    "latestInstructionHandling": "共通門檻已明訂為預設瀏覽器可開啟運作；目前無實際畫面或操作證據，結果仍 blocked。標準更正不重新授權已拒操作，沒有重試或轉用其他路徑。",
    "commonGateOutcome": "blocked"
  }
};
