import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  location: LocationTable;
  train: TrainTable;
  train_location: TrainLocationTable;
  train_location_forecast: TrainLocationForecastTable;
  train_formation: TrainFormationTable;
  train_formation_coach: TrainFormationCoachTable;
  train_formation_coach_loading: TrainFormationCoachLoadingTable;
  train_association: TrainAssociationTable;
  station_message: StationMessageTable;
  location_station_message: LocationStationMessageTable;
  schedule: ScheduleTable;
  schedule_location: ScheduleLocationTable;
  schedule_association: ScheduleAssociationTable;
}

export interface LocationTable {
  nlc: number;
  tiploc: string | null;
  stanox: string | null;
  three_alpha: string | null;
  uic: string | null;
  nlc_desc: string | null;
  nlc_desc_16: string | null;
  naptan_atco_code: string | null;
  naptan_common_name: string | null;
  naptan_nptg_locality_code: string | null;
  naptan_locality_name: string | null;
  naptan_parent_locality_name: string | null;
  naptan_grand_parent_locality_name: string | null;
  naptan_locality_centre: boolean | null;
  naptan_administrative_area_code: number | null;
  naptan_grid_type: string | null;
  naptan_easting: number | null;
  naptan_northing: number | null;
  naptan_longitude: number | null;
  naptan_latitude: number | null;
  bplan_location_name: string | null;
  bplan_is_off_network: boolean | null;
  bplan_easting: number | null;
  bplan_northing: number | null;
  bplan_longitude: number | null;
  bplan_latitude: number | null;
  bplan_start_date: string | null;
  bplan_end_date: string | null;
}

export type Location = Selectable<LocationTable>;
export type NewLocation = Insertable<LocationTable>;
export type LocationUpdate = Updateable<LocationTable>;

export interface TrainTable {
  rid: string;
  uid: string | null;
  rsid: string | null;
  toc: string | null;
  deleted: boolean | null;
  is_charter: boolean | null;
  is_passenger_service: boolean | null;
  is_active: boolean | null;
  scheduled_start_date: string | null;
  late_reason: number | null;
  late_reason_tiploc: string | null;
  late_reason_near: boolean | null;
  cancel_reason: number | null;
  cancel_reason_tiploc: string | null;
  cancel_reason_near: boolean | null;
  diverted_via_tiploc: string | null;
  diverted_via_near: boolean | null;
  diversion_reason: number | null;
  diversion_reason_tiploc: string | null;
  diversion_reason_near: boolean | null;
  is_reverse_formation: boolean | null;
}

export type Train = Selectable<TrainTable>;
export type NewTrain = Insertable<TrainTable>;
export type TrainUpdate = Updateable<TrainTable>;

export interface TrainFormationTable {
  id: Generated<number>;
  train_rid: string;
  fid: string | null;
}

export type TrainFormation = Selectable<TrainFormationTable>;
export type NewTrainFormation = Insertable<TrainFormationTable>;
export type TrainFormationUpdate = Updateable<TrainFormationTable>;

export interface TrainLocationTable {
  id: Generated<number>;
  train_rid: string;
  location_tiploc: string;
  train_formation_id: number | null;
  type: "OR" | "OPOR" | "IP" | "OPIP" | "PP" | "DT" | "OPDT" | null;
  platform: string | null;
  platform_suppressed: boolean | null;
  platform_confirmed: boolean | null;
  cis_platform_suppressed: boolean | null;
  length: number | null;
  detach_front: boolean | null;
  suppressed: boolean | null;
  late_reason: number | null;
  uncertainty_reason: number | null;
  uncertainty_status: string | null;
  affected_by: string | null;
  working_arrival_time: string | null;
  public_arrival_time: string | null;
  working_departure_time: string | null;
  public_departure_time: string | null;
  pass: boolean | null;
  cancel_reason: number | null;
  cancel_reason_tiploc: string | null;
  cancel_reason_near: boolean | null;
  false_location_tiploc: string | null;
  affected_by_diversion: boolean | null;
  cancelled: boolean | null;
  activity_codes: string | null;
  planned_activity_codes: string | null;
  lateness_seconds: number | null;
  loading_percentage: number | null;
  loading_percentage_type: string | null;
  loading_category: string | null;
  loading_category_type: string | null;
}

export type TrainLocation = Selectable<TrainLocationTable>;
export type NewTrainLocation = Insertable<TrainLocationTable>;
export type TrainLocationUpdate = Updateable<TrainLocationTable>;

export interface TrainLocationForecastTable {
  id: Generated<number>;
  train_location_id: number;
  type: "arrival" | "departure" | "pass";
  working_estimated_time: string | null;
  estimated_time: string | null;
  actual_time: string | null;
  actual_time_class: string | null;
  min_estimated_time: string | null;
  estimated_time_unknown: boolean | null;
  delayed: boolean | null;
}

export type TrainLocationForecast = Selectable<TrainLocationForecastTable>;
export type NewTrainLocationForecast = Insertable<TrainLocationForecastTable>;
export type TrainLocationForecastUpdate = Updateable<TrainLocationForecastTable>;

export type TrainFormationCoachTable = {
  id: Generated<number>;
  train_formation_id: number;
  number: string;
  class: string | null;
  toilet_availability: string | null;
  toilet_status: string | null;
};

export type TrainFormationCoach = Selectable<TrainFormationCoachTable>;
export type NewTrainFormationCoach = Insertable<TrainFormationCoachTable>;
export type TrainFormationCoachUpdate = Updateable<TrainFormationCoachTable>;

export interface TrainFormationCoachLoadingTable {
  id: Generated<number>;
  train_location_id: number;
  train_formation_coach_id: number;
  loading_percentage: number | null;
}

export type TrainFormationCoachLoading = Selectable<TrainFormationCoachLoadingTable>;
export type NewTrainFormationCoachLoading = Insertable<TrainFormationCoachLoadingTable>;
export type TrainFormationCoachLoadingUpdate = Updateable<TrainFormationCoachLoadingTable>;

export type TrainAssociationTable = {
  id: Generated<number>;
  main_train_location_id: number;
  associated_train_location_id: number;
  category: string | null;
  cancelled: boolean | null;
  deleted: boolean | null;
};

export type TrainAssociation = Selectable<TrainAssociationTable>;
export type NewTrainAssociation = Insertable<TrainAssociationTable>;
export type TrainAssociationUpdate = Updateable<TrainAssociationTable>;

export interface StationMessageTable {
  id: number;
  category: string | null;
  severity: number | null;
  suppressed: boolean | null;
  message: string | null;
  raw: string | null;
}

export type StationMessage = Selectable<StationMessageTable>;
export type NewStationMessage = Insertable<StationMessageTable>;
export type StationMessageUpdate = Updateable<StationMessageTable>;

export type LocationStationMessageTable = {
  location_three_alpha: string;
  station_message_id: number;
};

export type LocationStationMessage = Selectable<LocationStationMessageTable>;
export type NewLocationStationMessage = Insertable<LocationStationMessageTable>;
export type LocationStationMessageUpdate = Updateable<LocationStationMessageTable>;

export interface ScheduleTable {
  id: Generated<number>;
  train_uid: string;
  start_date: Date;
  end_date: Date;
  day_runs: string;
  day_mask: number;
  bank_holiday_running: string | null;
  train_status: string;
  stp_indicator: string;
  atoc_code: string | null;
  applicable_timetable: boolean | null;
  traction_class: string | null;
  uic_code: string | null;
  signalling_id: string | null;
  train_category: string | null;
  headcode: string | null;
  course_indicator: number | null;
  train_service_code: string | null;
  business_sector: string | null;
  power_type: string | null;
  timing_load: string | null;
  speed: string | null;
  operating_characteristics: string | null;
  train_class: string | null;
  sleepers: string | null;
  reservations: string | null;
  connection_indicator: string | null;
  catering_code: string | null;
  service_branding: string | null;
}

export type Schedule = Selectable<ScheduleTable>;
export type NewSchedule = Insertable<ScheduleTable>;
export type ScheduleUpdate = Updateable<ScheduleTable>;

export interface ScheduleLocationTable {
  id: Generated<number>;
  schedule_id: number;
  location_type: string;
  record_identity: string;
  location_tiploc: string;
  tiploc_instance: number | null;
  location_sequence: number;
  working_arrival_time: string | null;
  public_arrival_time: string | null;
  working_departure_time: string | null;
  public_departure_time: string | null;
  working_pass_time: string | null;
  platform: string | null;
  line: string | null;
  path: string | null;
  activity: string | null;
  engineering_allowance: string | null;
  pathing_allowance: string | null;
  performance_allowance: string | null;
}

export type ScheduleLocation = Selectable<ScheduleLocationTable>;
export type NewScheduleLocation = Insertable<ScheduleLocationTable>;
export type ScheduleLocationUpdate = Updateable<ScheduleLocationTable>;

export interface ScheduleAssociationTable {
  id: Generated<number>;
  main_train_uid: string;
  assoc_train_uid: string;
  assoc_start_date: Date;
  assoc_end_date: Date;
  assoc_days: string;
  day_mask: number;
  category: string | null;
  date_indicator: string | null;
  location_tiploc: string | null;
  base_location_suffix: number | null;
  assoc_location_suffix: number | null;
  stp_indicator: string | null;
}

export type ScheduleAssociation = Selectable<ScheduleAssociationTable>;
export type NewScheduleAssociation = Insertable<ScheduleAssociationTable>;
export type ScheduleAssociationUpdate = Updateable<ScheduleAssociationTable>;