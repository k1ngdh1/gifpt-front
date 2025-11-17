// src/components/ProjectCard.jsx
import React from "react";

export default function ProjectCard({
  title,
  thumbnail,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full h-[260px]
        rounded-2xl overflow-hidden bg-white
        shadow-[0_10px_25px_rgba(0,0,0,0.06)]
        border border-[#E5E7EB]
        text-left
        transition-transform transition-shadow
        hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(0,0,0,0.10)]
      "
    >
      {/* 썸네일 영역 */}
      <div className="h-[190px] w-full bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No preview
          </div>
        )}
      </div>

      {/* 하단 타이틀 그라데이션 바 */}
      <div
        className="
          h-[70px] w-full
          bg-gradient-to-t from-[#7C3AED] via-[#7C3AED] to-[#A855F7]
          px-4 flex items-center
        "
      >
        <span className="text-white text-[16px] font-semibold">
          {title}
        </span>
      </div>
    </button>
  );
}
