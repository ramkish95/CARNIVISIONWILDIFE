package com.wildguard.detection;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sightings")
@CrossOrigin(origins = "*")
public class DetectionController {

    @Autowired
    private SightingRepository sightingRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @PostMapping("/report")
    public SightingResponse reportSighting(@RequestBody SightingRequest request) {
        Sighting sighting = new Sighting();
        sighting.setSpecies(request.species());
        sighting.setConfidence(request.confidence());
        
        // Convert Lat/Long from request into a PostGIS Point
        sighting.setLocation(geometryFactory.createPoint(new Coordinate(request.longitude(), request.latitude())));
        
        Sighting saved = sightingRepository.save(sighting);

        // Return a clean response to avoid the Infinite Recursion error
        return new SightingResponse(
            saved.getId(),
            saved.getSpecies(),
            saved.getConfidence(),
            request.latitude(),
            request.longitude()
        );
    }

    @GetMapping("/recent")
    public List<Sighting> getRecentSightings() {
        return sightingRepository.findAll();
    }

    // --- NESTED CLASSES (Moved inside to prevent compilation errors) ---
    
    public record SightingRequest(String species, double confidence, double latitude, double longitude) {}

    public record SightingResponse(UUID id, String species, double confidence, double lat, double lon) {}
}