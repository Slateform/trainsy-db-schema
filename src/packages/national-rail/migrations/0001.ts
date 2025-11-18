import { Kysely, sql } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('location')
    .addColumn('nlc', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('tiploc', 'text', (col) => col.unique())
    .addColumn('stanox', 'text')
    .addColumn('three_alpha', 'text', (col) => col.unique())
    .addColumn('uic', 'text', (col) => col.unique())
    .addColumn('nlc_desc', 'text')
    .addColumn('nlc_desc_16', 'text')
    .addColumn('naptan_atco_code', 'text')
    .addColumn('naptan_common_name', 'text')
    .addColumn('naptan_nptg_locality_code', 'text')
    .addColumn('naptan_locality_name', 'text')
    .addColumn('naptan_parent_locality_name', 'text')
    .addColumn('naptan_grand_parent_locality_name', 'text')
    .addColumn('naptan_locality_centre', 'boolean')
    .addColumn('naptan_administrative_area_code', 'integer')
    .addColumn('naptan_grid_type', 'text')
    .addColumn('naptan_easting', 'integer')
    .addColumn('naptan_northing', 'integer')
    .addColumn('naptan_longitude', 'float8')
    .addColumn('naptan_latitude', 'float8')
    .addColumn('bplan_location_name', 'text')
    .addColumn('bplan_is_off_network', 'boolean')
    .addColumn('bplan_easting', 'integer')
    .addColumn('bplan_northing', 'integer')
    .addColumn('bplan_longitude', 'float8')
    .addColumn('bplan_latitude', 'float8')
    .addColumn('bplan_start_date', 'text')
    .addColumn('bplan_end_date', 'text')
    .execute();

  await db.schema
    .createTable('train')
    .addColumn('rid', 'text', (col) => col.notNull().primaryKey())
    .addColumn('uid', 'text')
    .addColumn('rsid', 'text')
    .addColumn('toc', 'text')
    .addColumn('deleted', 'boolean')
    .addColumn('is_charter', 'boolean')
    .addColumn('is_passenger_service', 'boolean')
    .addColumn('is_active', 'boolean')
    .addColumn('scheduled_start_date', 'text')
    .addColumn('late_reason', 'integer')
    .addColumn('late_reason_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('late_reason_near', 'boolean')
    .addColumn('cancel_reason', 'integer')
    .addColumn('cancel_reason_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('cancel_reason_near', 'boolean')
    .addColumn('diverted_via_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('diverted_via_near', 'boolean')
    .addColumn('diversion_reason', 'integer')
    .addColumn('diversion_reason_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('diversion_reason_near', 'boolean')
    .addColumn('is_reverse_formation', 'boolean')
    .execute();

  await db.schema
    .createTable('train_formation')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_rid', 'text', (col) => col.notNull().references('train.rid').onDelete('cascade'))
    .addColumn('fid', 'text', (col) => col.unique())
    .addUniqueConstraint('uq_train_rid_formation_id', ['train_rid', 'fid'], (con) =>
      con.nullsNotDistinct(),
    )
    .execute();

  await db.schema
    .createTable('train_location')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_rid', 'text', (col) => col.notNull().references('train.rid').onDelete('cascade'))
    .addColumn('location_tiploc', 'text', (col) =>
      col.notNull().references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('train_formation_id', 'integer', (col) =>
      col.references('train_formation.id').onDelete('cascade'),
    )
    .addColumn('type', 'text')
    .addColumn('platform', 'text')
    .addColumn('platform_suppressed', 'boolean')
    .addColumn('platform_confirmed', 'boolean')
    .addColumn('cis_platform_suppressed', 'boolean')
    .addColumn('length', 'integer')
    .addColumn('detach_front', 'boolean')
    .addColumn('suppressed', 'boolean')
    .addColumn('late_reason', 'integer')
    .addColumn('uncertainty_reason', 'integer')
    .addColumn('uncertainty_status', 'text')
    .addColumn('affected_by', 'text')
    .addColumn('working_arrival_time', 'text')
    .addColumn('public_arrival_time', 'text')
    .addColumn('working_departure_time', 'text')
    .addColumn('public_departure_time', 'text')
    .addColumn('pass', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('cancel_reason', 'integer')
    .addColumn('cancel_reason_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('cancel_reason_near', 'boolean')
    .addColumn('false_location_tiploc', 'text', (col) =>
      col.references('location.tiploc').onDelete('cascade'),
    )
    .addColumn('affected_by_diversion', 'boolean')
    .addColumn('cancelled', 'boolean')
    .addColumn('activity_codes', 'text')
    .addColumn('planned_activity_codes', 'text')
    .addColumn('lateness_seconds', 'integer')
    .addColumn('loading_percentage', 'integer')
    .addColumn('loading_percentage_type', 'text')
    .addColumn('loading_category', 'text')
    .addColumn('loading_category_type', 'text')
    .addUniqueConstraint('uq_train_rid_location_tiploc_working_arrival_time_pass', [
      'train_rid',
      'location_tiploc',
      'working_arrival_time',
      'pass',
    ])
    .execute();

  await db.schema
    .createTable('train_location_forecast')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_location_id', 'integer', (col) =>
      col.notNull().references('train_location.id').onDelete('cascade'),
    )
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('working_estimated_time', 'text')
    .addColumn('estimated_time', 'text')
    .addColumn('actual_time', 'text')
    .addColumn('actual_time_class', 'text')
    .addColumn('min_estimated_time', 'text')
    .addColumn('estimated_time_unknown', 'boolean')
    .addColumn('delayed', 'boolean')
    .addUniqueConstraint('uq_train_location_id_type', ['train_location_id', 'type'])
    .execute();

  await db.schema
    .createTable('train_formation_coach')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_formation_id', 'integer', (col) => col.notNull().references('train_formation.id').onDelete('cascade'))
    .addColumn('number', 'text', (col) => col.notNull())
    .addColumn('class', 'text')
    .addColumn('toilet_availability', 'text')
    .addColumn('toilet_status', 'text')
    .addUniqueConstraint('uq_train_formation_id_number', ['train_formation_id', 'number'])
    .execute();

  await db.schema
    .createTable('location_train_formation_coach_loading')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_location_id', 'integer', (col) =>
      col.notNull().references('train_location.id').onDelete('cascade'),
    )
    .addColumn('train_formation_coach_id', 'integer', (col) =>
      col.notNull().references('train_formation_coach.id').onDelete('cascade'),
    )
    .addColumn('loading_percentage', 'integer')
    .addUniqueConstraint('uq_train_location_id_train_formation_coach_id', [
      'train_location_id',
      'train_formation_coach_id',
    ])
    .execute();

  await db.schema
    .createTable('train_association')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('main_train_location_id', 'integer', (col) =>
      col.notNull().references('train_location.id').onDelete('cascade'),
    )
    .addColumn('associated_train_location_id', 'integer', (col) =>
      col.notNull().references('train_location.id').onDelete('cascade'),
    )
    .addColumn('category', 'text')
    .addColumn('cancelled', 'boolean')
    .addColumn('deleted', 'boolean')
    .addUniqueConstraint('uq_main_train_location_id_associated_train_location_id_category', [
      'main_train_location_id',
      'associated_train_location_id',
      'category',
    ])
    .execute();

  await db.schema
    .createTable('station_message')
    .addColumn('id', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('category', 'text')
    .addColumn('severity', 'integer')
    .addColumn('suppressed', 'boolean')
    .addColumn('message', 'text')
    .addColumn('raw', 'jsonb')
    .execute();

  await db.schema
    .createTable('location_station_message')
    .addColumn('location_three_alpha', 'text', (col) =>
      col.notNull().references('location.three_alpha').onDelete('cascade'),
    )
    .addColumn('station_message_id', 'integer', (col) =>
      col.notNull().references('station_message.id').onDelete('cascade'),
    )
    .addUniqueConstraint('uq_location_three_alpha_station_message_id', [
      'location_three_alpha',
      'station_message_id',
    ])
    .execute();

  await db.schema
    .createTable('schedule')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('train_uid', 'text', (col) => col.notNull())
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date', (col) => col.notNull())
    .addColumn('day_runs', 'text', (col) => col.notNull())
    .addColumn('day_mask', 'integer', (col) => col.notNull())
    .addColumn('bank_holiday_running', 'text')
    .addColumn('train_status', 'text', (col) => col.notNull())
    .addColumn('stp_indicator', 'text', (col) => col.notNull())
    .addColumn('atoc_code', 'text')
    .addColumn('applicable_timetable', 'boolean')
    .addColumn('traction_class', 'text')
    .addColumn('uic_code', 'text')
    .addColumn('signalling_id', 'text')
    .addColumn('train_category', 'text')
    .addColumn('headcode', 'text')
    .addColumn('course_indicator', 'integer')
    .addColumn('train_service_code', 'text')
    .addColumn('business_sector', 'text')
    .addColumn('power_type', 'text')
    .addColumn('timing_load', 'text')
    .addColumn('speed', 'integer')
    .addColumn('operating_characteristics', 'text')
    .addColumn('train_class', 'text')
    .addColumn('sleepers', 'text')
    .addColumn('reservations', 'text')
    .addColumn('connection_indicator', 'text')
    .addColumn('catering_code', 'text')
    .addColumn('service_branding', 'text')
    .addUniqueConstraint('uq_train_uid_start_date_end_date_stp_indicator_day_mask', [
      'train_uid',
      'start_date',
      'end_date',
      'stp_indicator',
      'day_mask',
    ], (con) =>
      con.nullsNotDistinct(),
    )
    .execute();
    
  await db.schema
    .createTable('schedule_location')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('schedule_id', 'integer', (col) => col.notNull().references('schedule.id').onDelete('cascade'))
    .addColumn('location_type', 'text', (col) => col.notNull())
    .addColumn('record_identity', 'text', (col) => col.notNull())
    .addColumn('location_tiploc', 'text', (col) => col.notNull())
    .addColumn('tiploc_instance', 'integer')
    .addColumn('location_sequence', 'integer')
    .addColumn('working_arrival_time', 'time')
    .addColumn('public_arrival_time', 'time')
    .addColumn('working_departure_time', 'time')
    .addColumn('public_departure_time', 'time')
    .addColumn('working_pass_time', 'time')
    .addColumn('platform', 'text')
    .addColumn('line', 'text')
    .addColumn('path', 'text')
    .addColumn('activity', 'text')
    .addColumn('engineering_allowance', sql`interval`)
    .addColumn('pathing_allowance', sql`interval`)
    .addColumn('performance_allowance', sql`interval`)
    .addUniqueConstraint('uq_schedule_id_location_tiploc_tiploc_instance', [
      'schedule_id',
      'location_tiploc',
      'tiploc_instance',
    ], (con) =>
      con.nullsNotDistinct(),
    )
    .execute();

  await db.schema
    .createTable('schedule_association')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('main_train_uid', 'text', (col) => col.notNull())
    .addColumn('assoc_train_uid', 'text', (col) => col.notNull())
    .addColumn('assoc_start_date', 'date', (col) => col.notNull())
    .addColumn('assoc_end_date', 'date', (col) => col.notNull())
    .addColumn('assoc_days', 'text', (col) => col.notNull())
    .addColumn('day_mask', 'integer', (col) => col.notNull())
    .addColumn('category', 'text')
    .addColumn('date_indicator', 'text')
    .addColumn('location_tiploc', 'text')
    .addColumn('base_location_suffix', 'integer')
    .addColumn('assoc_location_suffix', 'integer')
    .addColumn('stp_indicator', 'text')
    .addUniqueConstraint('uq_main_train_uid_assoc_train_uid_assoc_start_date_assoc_end_date_day_mask_category_location_tiploc_base_location_suffix_assoc_location_suffix_stp_indicator', [
      'main_train_uid',
      'assoc_train_uid',
      'assoc_start_date',
      'assoc_end_date',
      'day_mask',
      'category',
      'location_tiploc',
      'base_location_suffix',
      'assoc_location_suffix',
      'stp_indicator',
    ], (con) =>
      con.nullsNotDistinct(),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('location_station_message').execute();
  await db.schema.dropTable('station_message').execute();
  await db.schema.dropTable('train_association').execute();
  await db.schema.dropTable('train_formation_loading').execute();
  await db.schema.dropTable('train_formation_coach').execute();
  await db.schema.dropTable('train_location_forecast').execute();
  await db.schema.dropTable('train_location').execute();
  await db.schema.dropTable('train_formation').execute();
  await db.schema.dropTable('train').execute();
  await db.schema.dropTable('location').execute();
  await db.schema.dropTable('schedule').execute();
  await db.schema.dropTable('schedule_location').execute();
  await db.schema.dropTable('schedule_association').execute();
}
