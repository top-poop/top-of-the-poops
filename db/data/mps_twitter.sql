drop table if exists mps_twitter;

create table mps_twitter
(
    name          text,
    screen_name   text,
    party         text,
    constituency  text,
    followers     text,
    new_followers text
);

