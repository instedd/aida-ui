require "rails_helper"

RSpec.describe BackendError, :type => :helper do
  describe "skill errors" do
    it "returns errors for keyword reponder" do
        errors_in =
        [{
            "path" => "#/skills/0", "error" => {
                "valid_indices" => [], "invalid" => [{
                    "index" => 0, "errors" => [{
                        "path" => "#/keywords/en", "error" => {
                            "expected" => 1, "actual" => 0
                        }
                    }, {
                        "path" => "#/response/en", "error" => {
                            "expected" => 1, "actual" => 0
                        }
                    }]
                }, {
                    "index" => 1, "errors" => [{
                        "path" => "#/explanation", "error" => {
                            "expected" => ["string"], "actual" => "object"
                        }
                    }, {
                        "path" => "#/type", "error" => {}
                    }, {
                        "path" => "#/clarification", "error" => {}
                    }, {
                        "path" => "#/id", "error" => {}
                    }, {
                        "path" => "#/keywords", "error" => {}
                    }, {
                        "path" => "#/name", "error" => {}
                    }, {
                        "path" => "#/response", "error" => {}
                    }, {
                        "path" => "#", "error" => {
                            "missing" => ["languages"]
                        }
                    }]
                }, {
                    "index" => 2, "errors" => [{
                        "path" => "#", "error" => {
                            "valid_indices" => [], "invalid" => [{
                                "index" => 0, "errors" => [{
                                    "path" => "#/type", "error" => {}
                                }, {
                                    "path" => "#/clarification", "error" => {}
                                }, {
                                    "path" => "#/explanation", "error" => {}
                                }, {
                                    "path" => "#/keywords", "error" => {}
                                }, {
                                    "path" => "#/response", "error" => {}
                                }, {
                                    "path" => "#", "error" => {
                                        "missing" => ["schedule_type", "messages"]
                                    }
                                }]
                            }, {
                                "index" => 1, "errors" => [{
                                    "path" => "#/type", "error" => {}
                                }, {
                                    "path" => "#/clarification", "error" => {}
                                }, {
                                    "path" => "#/explanation", "error" => {}
                                }, {
                                    "path" => "#/keywords", "error" => {}
                                }, {
                                    "path" => "#/response", "error" => {}
                                }, {
                                    "path" => "#", "error" => {
                                        "missing" => ["schedule_type", "messages"]
                                    }
                                }]
                            }, {
                                "index" => 2, "errors" => [{
                                    "path" => "#/type", "error" => {}
                                }, {
                                    "path" => "#/clarification", "error" => {}
                                }, {
                                    "path" => "#/explanation", "error" => {}
                                }, {
                                    "path" => "#/keywords", "error" => {}
                                }, {
                                    "path" => "#/response", "error" => {}
                                }, {
                                    "path" => "#", "error" => {
                                        "missing" => ["schedule_type", "messages"]
                                    }
                                }]
                            }]
                        }
                    }]
                }, {
                    "index" => 3, "errors" => [{
                        "path" => "#/keywords/en", "error" => {
                            "expected" => 1, "actual" => 0
                        }
                    }, {
                        "path" => "#/type", "error" => {}
                    }, {
                        "path" => "#/response", "error" => {}
                    }, {
                        "path" => "#", "error" => {
                            "missing" => ["tree"]
                        }
                    }]
                }, {
                    "index" => 4, "errors" => [{
                        "path" => "#/keywords/en", "error" => {
                            "expected" => 1, "actual" => 0
                        }
                    }, {
                        "path" => "#/type", "error" => {}
                    }, {
                        "path" => "#/clarification", "error" => {}
                    }, {
                        "path" => "#/explanation", "error" => {}
                    }, {
                        "path" => "#/response", "error" => {}
                    }, {
                        "path" => "#", "error" => {
                            "missing" => ["questions", "choice_lists"]
                        }
                    }]
                }]
            }
        }]
        errors_out = [{:message=>"required", :path=>["skills/0", "keywords/en"]}, {:message=>"required", :path=>["skills/0", "response/en"]}]
        expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end
    it "returns errors for survey" do
        errors_in =
        [{
            "path" => "#/skills/0",
            "error" => {
              "valid_indices" => [], "invalid" => [{
                "index" => 0,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/choice_lists",
                  "error" => {}
                }, {
                  "path" => "#/questions",
                  "error" => {}
                }, {
                  "path" => "#/schedule",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "clarification", "keywords", "response"]
                  }
                }]
              }, {
                "index" => 1,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/choice_lists",
                  "error" => {}
                }, {
                  "path" => "#/id",
                  "error" => {}
                }, {
                  "path" => "#/name",
                  "error" => {}
                }, {
                  "path" => "#/questions",
                  "error" => {}
                }, {
                  "path" => "#/schedule",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "languages"]
                  }
                }]
              }, {
                "index" => 2,
                "errors" => [{
                  "path" => "#",
                  "error" => {
                    "valid_indices" => [], "invalid" => [{
                      "index" => 0,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/choice_lists",
                        "error" => {}
                      }, {
                        "path" => "#/questions",
                        "error" => {}
                      }, {
                        "path" => "#/schedule",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }, {
                      "index" => 1,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/choice_lists",
                        "error" => {}
                      }, {
                        "path" => "#/questions",
                        "error" => {}
                      }, {
                        "path" => "#/schedule",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }, {
                      "index" => 2,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/choice_lists",
                        "error" => {}
                      }, {
                        "path" => "#/questions",
                        "error" => {}
                      }, {
                        "path" => "#/schedule",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }]
                  }
                }]
              }, {
                "index" => 3,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/choice_lists",
                  "error" => {}
                }, {
                  "path" => "#/questions",
                  "error" => {}
                }, {
                  "path" => "#/schedule",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "clarification", "keywords", "tree"]
                  }
                }]
              }, {
                "index" => 4,
                "errors" => [{
                  "path" => "#/questions",
                  "error" => {
                    "expected" => 1, "actual" => 0
                  }
                }, {
                  "path" => "#/schedule",
                  "error" => {
                    "expected" => "^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(\\.(\\d{3})){0,1}([+-](\\d{2}):(\\d{2})|Z)$"
                  }
                }]
              }]
            }
          }]
        errors_out = [{:message=>"required", :path=>["skills/0", "questions"]}, {:message=>"", :path=>["skills/0", "schedule"]}]
        expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end

    it "returns errors for decision tree" do
        errors_in =
        [{
            "path" => "#/skills/0",
            "error" => {
              "valid_indices" => [], "invalid" => [{
                "index" => 0,
                "errors" => [{
                  "path" => "#/keywords/en",
                  "error" => {
                    "expected" => 1, "actual" => 0
                  }
                }, {
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/tree",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["response"]
                  }
                }]
              }, {
                "index" => 1,
                "errors" => [{
                  "path" => "#/explanation",
                  "error" => {
                    "expected" => ["string"], "actual" => "object"
                  }
                }, {
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/clarification",
                  "error" => {}
                }, {
                  "path" => "#/id",
                  "error" => {}
                }, {
                  "path" => "#/keywords",
                  "error" => {}
                }, {
                  "path" => "#/name",
                  "error" => {}
                }, {
                  "path" => "#/tree",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["languages"]
                  }
                }]
              }, {
                "index" => 2,
                "errors" => [{
                  "path" => "#",
                  "error" => {
                    "valid_indices" => [], "invalid" => [{
                      "index" => 0,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/clarification",
                        "error" => {}
                      }, {
                        "path" => "#/explanation",
                        "error" => {}
                      }, {
                        "path" => "#/keywords",
                        "error" => {}
                      }, {
                        "path" => "#/tree",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }, {
                      "index" => 1,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/clarification",
                        "error" => {}
                      }, {
                        "path" => "#/explanation",
                        "error" => {}
                      }, {
                        "path" => "#/keywords",
                        "error" => {}
                      }, {
                        "path" => "#/tree",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }, {
                      "index" => 2,
                      "errors" => [{
                        "path" => "#/type",
                        "error" => {}
                      }, {
                        "path" => "#/clarification",
                        "error" => {}
                      }, {
                        "path" => "#/explanation",
                        "error" => {}
                      }, {
                        "path" => "#/keywords",
                        "error" => {}
                      }, {
                        "path" => "#/tree",
                        "error" => {}
                      }, {
                        "path" => "#",
                        "error" => {
                          "missing" => ["schedule_type", "messages"]
                        }
                      }]
                    }]
                  }
                }]
              }, {
                "index" => 3,
                "errors" => [{
                  "path" => "#/keywords/en",
                  "error" => {
                    "expected" => 1, "actual" => 0
                  }
                }, {
                  "path" => "#/tree/answer",
                  "error" => {}
                }, {
                  "path" => "#/tree",
                  "error" => {
                    "missing" => ["question", "responses"]
                  }
                }]
              }, {
                "index" => 4,
                "errors" => [{
                  "path" => "#/keywords/en",
                  "error" => {
                    "expected" => 1, "actual" => 0
                  }
                }, {
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/clarification",
                  "error" => {}
                }, {
                  "path" => "#/explanation",
                  "error" => {}
                }, {
                  "path" => "#/tree",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["questions", "choice_lists"]
                  }
                }]
              }]
            }
          }]
        errors_out = [{:message=>"required", :path=>["skills/0", "keywords/en"]}, {:message=>"", :path=>["skills/0", "tree/answer"]}, {:message=>"", :path=>["skills/0", "tree"]}]
        expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end

    it "returns errors for scheduled messages" do
        errors_in =
        [{
            "path" => "#/skills/0",
            "error" => {
              "valid_indices" => [], "invalid" => [{
                "index" => 0,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/messages",
                  "error" => {}
                }, {
                  "path" => "#/schedule_type",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "clarification", "keywords", "response"]
                  }
                }]
              }, {
                "index" => 1,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/id",
                  "error" => {}
                }, {
                  "path" => "#/messages",
                  "error" => {}
                }, {
                  "path" => "#/name",
                  "error" => {}
                }, {
                  "path" => "#/schedule_type",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "languages"]
                  }
                }]
              }, {
                "index" => 2,
                "errors" => [{
                  "path" => "#",
                  "error" => {
                    "valid_indices" => [], "invalid" => [{
                      "index" => 0,
                      "errors" => [{
                        "path" => "#/messages",
                        "error" => {
                          "expected" => 1, "actual" => 0
                        }
                      }]
                    }, {
                      "index" => 1,
                      "errors" => [{
                        "path" => "#/messages",
                        "error" => {
                          "expected" => 1, "actual" => 0
                        }
                      }, {
                        "path" => "#/schedule_type",
                        "error" => {}
                      }]
                    }, {
                      "index" => 2,
                      "errors" => [{
                        "path" => "#/messages",
                        "error" => {
                          "expected" => 1, "actual" => 0
                        }
                      }, {
                        "path" => "#/schedule_type",
                        "error" => {}
                      }]
                    }]
                  }
                }]
              }, {
                "index" => 3,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/messages",
                  "error" => {}
                }, {
                  "path" => "#/schedule_type",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["explanation", "clarification", "keywords", "tree"]
                  }
                }]
              }, {
                "index" => 4,
                "errors" => [{
                  "path" => "#/type",
                  "error" => {}
                }, {
                  "path" => "#/messages",
                  "error" => {}
                }, {
                  "path" => "#/schedule_type",
                  "error" => {}
                }, {
                  "path" => "#",
                  "error" => {
                    "missing" => ["questions", "choice_lists"]
                  }
                }]
              }]
            }
          }]
        errors_out = [] #FIX ME
        expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end

    it "returns errors when it has no skills" do
      errors_in = [{"path"=>"#/skills", "error"=>{"expected"=>1, "actual"=>0}}]
      errors_out = [{:message=>"There needs to be at least one skill", :path=>["skills"]}]
      expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end
  end

  describe "front desk errors" do
    it "returns errors when it has no skills" do
      errors_in =
      [{
        "path" => "#/front_desk/clarification/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/greeting/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/introduction/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/not_understood/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/unsubscribe/acknowledge_message/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/unsubscribe/introduction_message/message/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }, {
        "path" => "#/front_desk/unsubscribe/keywords/en",
        "error" => {
          "expected" => 1, "actual" => 0
        }
      }]
      errors_out =
      [
        {:message=>"required", :path=>["front_desk/clarification/message/en"]},
        {:message=>"required", :path=>["front_desk/greeting/message/en"]},
        {:message=>"required", :path=>["front_desk/introduction/message/en"]},
        {:message=>"required", :path=>["front_desk/not_understood/message/en"]},
        {:message=>"required", :path=>["front_desk/unsubscribe/acknowledge_message/message/en"]},
        {:message=>"required", :path=>["front_desk/unsubscribe/introduction_message/message/en"]},
        {:message=>"required", :path=>["front_desk/unsubscribe/keywords/en"]}
      ]
      expect(BackendError.parse_errors(errors_in)).to eq(errors_out)
    end
  end
end
