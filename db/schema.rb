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

ActiveRecord::Schema.define(version: 20171228180737) do

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

  create_table "identities", force: :cascade do |t|
    t.integer "user_id"
    t.string "provider"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
  add_foreign_key "translations", "behaviours"
  add_foreign_key "variable_assignments", "bots"
end
