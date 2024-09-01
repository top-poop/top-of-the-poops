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


def test_receiving_water_description_populated():
    count = run_sql("""
select count(*) from edm_consent_view where rec_env_code_description is null
    """)[0]["count"]

    assert count == 0


def test_can_resolve_constituency_for_almost_every_grid_reference():
    # some grid references are way out in the sea. ?
    count = run_sql("""
select count(*) as count from grid_references where pcon24nm is null;
    """)[0]["count"]

    assert count == 56


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
select * from pcon_july_2024_uk_bfc as con
left join mps on con.pcon24nm = mps.constituency
where mps.constituency is null    
    """)

    # due to tragic incident, no current MP for Southend West

    assert len(result) == 1


def test_have_mapped_all_grid_references():
    count = run_sql("""
    select count(*) from edm_consent_view
left join grid_references on effluent_grid_ref = grid_reference
where grid_reference is null
""")[0]["count"]
    assert count == 0
