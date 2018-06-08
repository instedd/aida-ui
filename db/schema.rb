# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180608153633) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "behaviours", force: :cascade do |t|
    t.bigint "bot_id"
    t.string "name"
    t.string "kind"
    t.json "config"
    t.boolean "enabled", default: true
    t.integer "order"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bot_id"], name: "index_behaviours_on_bot_id"
  end

  create_table "bots", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "owner_id"
    t.string "uuid"
    t.string "preview_uuid"
    t.index ["owner_id"], name: "index_bots_on_owner_id"
  end

  create_table "channels", force: :cascade do |t|
    t.bigint "bot_id"
    t.string "name"
    t.string "kind"
    t.json "config"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bot_id"], name: "index_channels_on_bot_id"
  end

  create_table "collaborators", force: :cascade do |t|
    t.bigint "bot_id"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "roles", default: [], array: true
    t.index ["bot_id", "user_id"], name: "index_collaborators_on_bot_id_and_user_id", unique: true
    t.index ["bot_id"], name: "index_collaborators_on_bot_id"
    t.index ["user_id"], name: "index_collaborators_on_user_id"
  end

  create_table "data_tables", force: :cascade do |t|
    t.bigint "bot_id"
    t.string "name", null: false
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bot_id"], name: "index_data_tables_on_bot_id"
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "identities", force: :cascade do |t|
    t.integer "user_id"
    t.string "provider"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "invitations", force: :cascade do |t|
    t.bigint "bot_id"
    t.bigint "creator_id"
    t.string "email"
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "roles", default: [], array: true
    t.index ["bot_id", "email"], name: "index_invitations_on_bot_id_and_email", unique: true
    t.index ["bot_id"], name: "index_invitations_on_bot_id"
    t.index ["creator_id"], name: "index_invitations_on_creator_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
  end

  create_table "translations", force: :cascade do |t|
    t.bigint "behaviour_id"
    t.string "key", null: false
    t.string "lang", null: false
    t.string "value", limit: 1024
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["behaviour_id", "key", "lang"], name: "index_translations_on_behaviour_id_and_key_and_lang", unique: true
    t.index ["behaviour_id"], name: "index_translations_on_behaviour_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "name"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_key"
    t.string "encrypted_secret_key"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "variable_assignments", force: :cascade do |t|
    t.bigint "bot_id"
    t.string "variable_id", null: false
    t.string "variable_name"
    t.string "condition_id"
    t.string "condition", limit: 1024
    t.integer "condition_order"
    t.string "value", limit: 1024
    t.string "lang"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bot_id"], name: "index_variable_assignments_on_bot_id"
  end

  add_foreign_key "behaviours", "bots"
  add_foreign_key "bots", "users", column: "owner_id"
  add_foreign_key "channels", "bots"
  add_foreign_key "collaborators", "bots"
  add_foreign_key "collaborators", "users"
  add_foreign_key "data_tables", "bots"
  add_foreign_key "invitations", "bots"
  add_foreign_key "invitations", "users", column: "creator_id"
  add_foreign_key "translations", "behaviours"
  add_foreign_key "variable_assignments", "bots"
end
