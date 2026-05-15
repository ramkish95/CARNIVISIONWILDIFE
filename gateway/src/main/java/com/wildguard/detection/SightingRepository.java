package com.wildguard.detection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.locationtech.jts.geom.Point;
import java.util.List;
import java.util.UUID;

public interface SightingRepository extends JpaRepository<Sighting, UUID> {
    
    // Example Spatial Query: Find sightings within 'distance' meters of a point
    @Query(value = "SELECT * FROM sightings s WHERE ST_DWithin(s.location, :point, :distance)", nativeQuery = true)
    List<Sighting> findSightingsNear(@Param("point") Point point, @Param("distance") double distance);
}