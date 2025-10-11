// src/components/PaginationDots.tsx
interface PaginationDotsProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  }
  
  const PaginationDots = ({ totalPages, currentPage, onPageChange }: PaginationDotsProps) => {
    if (totalPages <= 1) return null;
  
    return (
      <div
        className="
          fixed bottom-[5.5rem] left-1/2 transform -translate-x-1/2
          flex justify-center gap-2
          md:static md:mt-6
        "
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => onPageChange(i + 1)}
          />
        ))}
      </div>
    );
  };
  
  export default PaginationDots;
  