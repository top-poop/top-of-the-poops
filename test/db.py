import psycopg2


def run_sql(sql):
    with psycopg2.connect(host="localhost", database="gis", user="docker", password="docker") as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql)

            columns = [desc[0] for desc in cursor.description]

            result = []

            for row in cursor.fetchall():
                result.append(dict(zip(columns, row)))
    return result


def test_can_resolve_lat_long_for_every_grid_reference_in_consents():
    count = run_sql("""
    select count(*) as count 
    from consents
    left join grid_references outlet_grid on outlet_grid.grid_reference = outlet_grid_ref
    left join grid_references effluent_grid on effluent_grid.grid_reference = effluent_grid_ref
    where effluent_grid.lat is null or outlet_grid.lat is null
    """)[0]["count"]

    assert count == 0


def test_can_match_every_constituency_to_an_mp():
    result = run_sql("""
select * from pcon_dec_2020_uk_bfc as con
left join mps on con.pcon20nm = mps.constituency
where mps.constituency is null    
    """)

    # due to tragic incident, no current MP for Southend West

    assert len(result) == 1
